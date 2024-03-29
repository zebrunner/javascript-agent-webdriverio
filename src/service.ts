import type { Services } from '@wdio/types';
import { RemoteCapabilities, RemoteCapability } from '@wdio/types/build/Capabilities';
import { Testrunner as TestrunnerOptions } from '@wdio/types/build/Options';
import { ReporterEntry } from '@wdio/types/build/Reporters';
import { Test, TestResult } from '@wdio/types/build/Frameworks';
import { ZebrunnerReporter } from './reporter';
import { ReportingConfig, ScreenshotConfig } from './reporting-config';
import { ApiClient } from './api-client';
import {
    AttachArtifactReferencesRequest,
    AttachLabelsRequest,
    ExchangedRunContext,
    FinishTestRunRequest,
    FinishTestSessionRequest,
    StartTestRunRequest,
    StartTestSessionRequest,
    UpdateTcmConfigsRequest,
} from './types';
import { Storage } from './storage';
import { isNotBlankString, isNotEmptyArray } from './type-utils';
import { Labels } from './constant/labels';
import { currentTest } from './current-test';

export class ZebrunnerService implements Services.ServiceInstance {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // common for both services
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private storage: Storage;

    private apiClient: ApiClient;

    private reportingConfig: ReportingConfig;

    private screenshotConfig: ScreenshotConfig;

    constructor(serviceOptions, capabilities, config) {
        this.initializeDependencies(config);
    }

    private initializeDependencies(config: TestrunnerOptions): ReportingConfig {
        const { reporters }: { reporters?: ReporterEntry[] } = config;
        const [, reporterConfig]: any = reporters.find((reporterAndConfig) => reporterAndConfig[0].name === ZebrunnerReporter.name);

        const reportingConfig = new ReportingConfig(reporterConfig);

        global.zebrunnerReporterStorage = new Storage(reportingConfig);
        this.storage = global.zebrunnerReporterStorage;
        this.apiClient = this.storage.apiClient;
        this.reportingConfig = this.storage.reportingConfig;
        this.screenshotConfig = this.reportingConfig.screenshot;

        return reportingConfig;
    }

    private async initializeRunContext() {
        let runUuid = null;

        let runContext = this.reportingConfig.launch.context;
        if (runContext?.length) {
            const exchangedRunContext: ExchangedRunContext = await this.apiClient.exchangeRunContext(runContext);
            if (!exchangedRunContext.runAllowed) {
                throw new Error(`Zebrunner Reporting is not allowed. Reason: ${exchangedRunContext.reason}`);
            }

            runUuid = exchangedRunContext.testRunUuid;
            if (exchangedRunContext.runOnlySpecificTests) {
                runContext = exchangedRunContext.fullExecutionPlanContext;

                const exchangedFullRunContext: ExchangedRunContext = await this.apiClient.exchangeRunContext(runContext);
                this.storage.setupRerunData(exchangedRunContext.testsToRun, exchangedFullRunContext.testsToRun);
            }
        }
        return runUuid;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // launcher service callbacks
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async onPrepare(config: TestrunnerOptions, capabilities: any) {
        const runUuid = await this.initializeRunContext();

        await this.startTestRun(runUuid);
        await this.saveTcmConfigs();
        await this.saveTestRunLabels();
        return this.saveTestRunArtifactReferences();
    }

    private async startTestRun(runUuid) {
        const request = new StartTestRunRequest(runUuid, this.reportingConfig);
        this.storage.testRunId = await this.apiClient.startTestRun(this.reportingConfig.projectKey, request);
    }

    private async saveTcmConfigs() {
        const request = new UpdateTcmConfigsRequest(this.reportingConfig);
        if (request.hasAnyValue) {
            return this.apiClient.updateTcmConfigs(this.storage.testRunId, request);
        }
    }

    private async saveTestRunLabels() {
        const labels = this.reportingConfig.launch.labels || [];
        const { locale } = this.reportingConfig.launch;
        if (isNotBlankString(locale)) {
            labels.push({
                key: Labels.LOCALE,
                value: locale
            });
        }

        if (isNotEmptyArray(labels)) {
            const request = AttachLabelsRequest.of(labels);
            await this.apiClient.attachTestRunLabels(this.storage.testRunId, request);
        }
    }

    private saveTestRunArtifactReferences() {
        const artifactReferences = this.reportingConfig.launch.artifactReferences || [];
        if (isNotEmptyArray(artifactReferences)) {
            const request = AttachArtifactReferencesRequest.of(artifactReferences);
            return this.apiClient.attachTestRunArtifactReferences(this.storage.testRunId, request);
        }
    }

    async onComplete(exitCode: number, config: any, capabilities: RemoteCapabilities, results: any) {
        // todo add shutdown hook
        if (this.storage.testRunId) {
            const request = new FinishTestRunRequest();
            return this.apiClient.finishTestRun(this.storage.testRunId, request);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // worker service properties and callbacks
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    private browser: any;

    private desiredCapabilities: RemoteCapability;

    // this callback is invoked only before first session.
    // even if a test reloads session, this method is not invoked again.
    // on session reload only the #onReload() callback is invoked
    async beforeSession(config: Omit<TestrunnerOptions, 'capabilities'>, capabilities: RemoteCapability, specs: string[], cid: string) {
        await this.initializeRunContext();

        this.filterOutSpecsOnRerun(specs);

        if (process.env.REPORTING_RUN_SUBSTITUTE_REMOTE_WEB_DRIVERS === 'true') {
            ZebrunnerService.substituteHubProperties(config);
            ZebrunnerService.substituteCapabilities(capabilities);
        }
    }

    private filterOutSpecsOnRerun(specs: string[]) {
        for (let i = 0; i < specs.length; i += 1) {
            if (!this.storage.isSpecToRerun(specs[i])) {
                specs.splice(i, 1);
                i -= 1;
            }
        }
    }

    private static substituteHubProperties(config) {
        const hubUrlString = process.env.ZEBRUNNER_HUB_URL;

        if (isNotBlankString(hubUrlString)) {
            const hubUrl = new URL(hubUrlString);

            const protocol = hubUrl.protocol.slice(0, -1);
            let port = parseInt(hubUrl.port, 10);
            if (!port) {
                port = protocol === 'https' ? 443 : 80;
            }

            config.protocol = protocol;
            config.hostname = hubUrl.hostname;
            config.port = port;
            config.path = hubUrl.pathname;
            config.user = hubUrl.username;
            config.key = hubUrl.password;
        }
    }

    private static substituteCapabilities(capabilities) {
        const capabilitiesString = process.env.ZEBRUNNER_CAPABILITIES;

        if (isNotBlankString(capabilitiesString)) {
            const capabilitiesObject = JSON.parse(capabilitiesString);
            Object.keys(capabilitiesObject)
                .forEach((key: string) => {
                    const keyParts = key.split('.');

                    let capabilitiesNode = capabilities;
                    for (let i = 0; i < keyParts.length - 1; i++) {
                        const keyPart = keyParts[i];
                        capabilitiesNode = capabilitiesNode[keyPart] = capabilitiesNode[keyPart] || {};
                    }

                    capabilitiesNode[keyParts[keyParts.length - 1]] = capabilitiesObject[key];
                });
            delete capabilities.provider;
        }
    }

    async before(capabilities: RemoteCapability, specs: string[], browser: any) {
        this.browser = browser;
        this.desiredCapabilities = capabilities;

        const request = StartTestSessionRequest.running(browser, capabilities);
        this.storage.testSessionId = this.apiClient.startTestSession(this.storage.testRunId, request);

        return this.storage.testSessionId;
    }

    async onReload(oldSessionId: string, newSessionId: string) {
        const finishRequest = new FinishTestSessionRequest();
        const testSessionId = await this.storage.testSessionId;
        await this.apiClient.finishTestSession(this.storage.testRunId, testSessionId, finishRequest);

        const testId = await this.storage.testId;
        const startRequest = StartTestSessionRequest.running(this.browser, this.desiredCapabilities, testId);
        this.storage.testSessionId = this.apiClient.startTestSession(this.storage.testRunId, startRequest);

        return this.storage.testSessionId;
    }

    async after(result: number, capabilities: RemoteCapability, specs: string[]) {
        const testSessionId = await this.storage.testSessionId;

        if (testSessionId) {
            const request = new FinishTestSessionRequest();
            return this.apiClient.finishTestSession(this.storage.testRunId, testSessionId, request);
        }

        const request = StartTestSessionRequest.failed(capabilities);
        return this.apiClient.startTestSession(this.storage.testRunId, request);
    }

    async afterTest(test: Test, context: any, result: TestResult) {
        if (result?.error) {
            return currentTest.saveScreenshot(this.browser);
        }
    }

    async beforeCommand(commandName: string, args: any[]) {
        if (this.screenshotConfig.beforeCommands.has(commandName)) {
            return currentTest.saveScreenshot(this.browser);
        }
    }

    async afterCommand(commandName: string, args: any[], result: any, error?: Error) {
        if (this.screenshotConfig.afterCommands.has(commandName)) {
            return currentTest.saveScreenshot(this.browser);
        }
    }

}
