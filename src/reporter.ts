import WDIOReporter, { RunnerStats, TestStats } from '@wdio/reporter';
import SuiteStats from '@wdio/reporter/build/stats/suite';
import { Buffer } from 'buffer';
import log from 'loglevel';
import { ApiClient } from './api-client';
import {
    AttachArtifactReferencesRequest,
    AttachLabelsRequest,
    CorrelationData,
    FinishTestRequest,
    LinkTestsAndTestSessionRequest,
    StartTestRequest,
    TestCase,
    TestFinishStatus,
    UpdateTestRequest,
    UpsertTestTestCases,
} from './types';
import { EventNames } from './constant';
import { Storage } from './storage';
import { LogsManager } from './logs-manager';
import { isNotBlankString } from './type-utils';

export class ZebrunnerReporter extends WDIOReporter {

    private readonly log = log.getLogger('zebrunner');

    private readonly storage: Storage;
    private readonly apiClient: ApiClient;
    private readonly logsManager: LogsManager;

    private allEventsReportedToZebrunner: boolean;

    constructor(reporterConfig) {
        super(reporterConfig);

        this.storage = global.zebrunnerReporterStorage;
        if (!this.storage || !this.storage.testRunId) {
            throw Error('Cannot initialize ZebrunnerReporter since ZebrunnerService didn\'t perform initialization correctly');
        }

        this.apiClient = this.storage.apiClient;
        this.logsManager = new LogsManager(this.storage);

        this.allEventsReportedToZebrunner = true;
    }

    get isSynchronised() {
        return this.allEventsReportedToZebrunner;
    }

    onRunnerStart(runnerStats: RunnerStats) {
        this.allEventsReportedToZebrunner = false;
        this.registerActionListeners();
    }

    private registerActionListeners() {
        process.on(EventNames.SET_TEST_MAINTAINER, this.setTestMaintainer.bind(this));
        process.on(EventNames.REVERT_TEST_REGISTRATION, this.revertTestRegistration.bind(this));

        process.on(EventNames.ATTACH_TEST_RUN_LABELS, this.attachTestRunLabels.bind(this));
        process.on(EventNames.ATTACH_TEST_LABELS, this.attachTestLabels.bind(this));

        process.on(EventNames.ATTACH_TEST_RUN_ARTIFACT_REFERENCES, this.attachTestRunArtifactReferences.bind(this));
        process.on(EventNames.ATTACH_TEST_ARTIFACT_REFERENCES, this.attachTestArtifactReferences.bind(this));

        process.on(EventNames.SAVE_TEST_SCREENSHOT_BUFFER, this.saveScreenshotBuffer.bind(this));
        process.on(EventNames.ADD_TEST_CASE, this.addTestCases.bind(this));
    }

    onSuiteStart(suiteStats: SuiteStats) {
        this.storage.currentSpec = suiteStats.file;
    }

    async onTestStart(testStats: TestStats) {
        this.storage.currentTest = testStats;

        const spec = this.storage.currentSpec;
        const correlationData = new CorrelationData(spec, testStats.fullTitle).stringify();
        const request = new StartTestRequest(testStats, spec, correlationData);

        const testIdToRerun = this.storage.getTestIdToRerun(correlationData);
        this.storage.testId = testIdToRerun
            ? this.apiClient.restartTest(this.storage.testRunId, testIdToRerun, request)
            : this.apiClient.startTest(this.storage.testRunId, request);

        // if test will fail before test session start completes,
        // the following linking request will use wrong test id from storage
        // to avoid this, we need to store the test id into a separate variable
        const { testId } = this.storage;

        return this.storage.trackOperationPromise(async () => {
            // wdio does not wait for this method to complete, so it is better to wait for session first id and only then wait for test id,
            // because browser.reloadSession() can be invoked before the start test request completes
            const testSessionId = await this.storage.testSessionId;
            const linkRequest = LinkTestsAndTestSessionRequest.ofSingleTest(await testId);
            return this.apiClient.linkTestsAndTestSession(this.storage.testRunId, testSessionId, linkRequest);
        });
    }

    async onTestPass(testStats: TestStats) {
        return this.onTestFinish(testStats, 'PASSED');
    }

    async onTestFail(testStats: TestStats) {
        return this.onTestFinish(testStats, 'FAILED');
    }

    async onTestSkip(testStats: TestStats) {
        return this.storage.trackOperationPromise(async () => {
            if (testStats.uid !== this.storage.currentTest.uid) {
                // intentionally don't await for the onTestStart promise resolution,
                // because we need to immediately get the testId promise in onTestFinish()
                this.onTestStart(testStats);

                return this.onTestFinish(testStats, 'SKIPPED');
            }
        });
    }

    async onTestFinish(testStats: TestStats, status: TestFinishStatus, testCaseDefaultStatus?: string) {
        return this.storage.trackOperationPromise(async () => {
            // in order to not lost the test id between these asynchronous operations,
            // store testId promise to a separate variable
            const testId: Promise<number> = this.storage.testId;
            // the test cases also must be set to a variable. otherwise, we can lose them
            const testTestCases = this.storage.testTestCases;

            // we need to log error first and only then track test cases and test finish
            const stack: string = testStats.errors?.[0]?.stack;
            if (stack) {
                this.log.error(stack);
            }

            if (testId) {
                if (testTestCases?.length) {
                    this.setDefaultStatusIfActualNotProvided(testTestCases, testCaseDefaultStatus);

                    // it is more natural to track test cases before finish of the test
                    const request: UpsertTestTestCases = { items: testTestCases };
                    await this.apiClient.upsertTestTestCases(this.storage.testRunId, await testId, request);
                }

                const finishTestRequest = new FinishTestRequest(status, stack);
                return this.apiClient.finishTest(this.storage.testRunId, await testId, finishTestRequest);
            }
        });
    }

    private setDefaultStatusIfActualNotProvided(testTestCases: TestCase[], testCaseDefaultStatus?: string) {
        if (isNotBlankString(testCaseDefaultStatus)) {
            testTestCases.forEach((testCase: TestCase) => {
                if (!testCase.resultStatus) {
                    testCase.resultStatus = testCaseDefaultStatus;
                }
            });
        }
    }

    async onRunnerEnd(runStats: RunnerStats) {
        await this.logsManager.close();
        await this.storage.allOperationPromises();

        this.removeActionListeners();
        this.allEventsReportedToZebrunner = true;
    }

    private removeActionListeners() {
        process.off(EventNames.SET_TEST_MAINTAINER, this.setTestMaintainer.bind(this));
        process.off(EventNames.REVERT_TEST_REGISTRATION, this.revertTestRegistration.bind(this));

        process.off(EventNames.ATTACH_TEST_RUN_LABELS, this.attachTestRunLabels.bind(this));
        process.off(EventNames.ATTACH_TEST_LABELS, this.attachTestLabels.bind(this));

        process.off(EventNames.ATTACH_TEST_RUN_ARTIFACT_REFERENCES, this.attachTestRunArtifactReferences.bind(this));
        process.off(EventNames.ATTACH_TEST_ARTIFACT_REFERENCES, this.attachTestArtifactReferences.bind(this));

        process.off(EventNames.SAVE_TEST_SCREENSHOT_BUFFER, this.saveScreenshotBuffer.bind(this));
        process.off(EventNames.ADD_TEST_CASE, this.addTestCases.bind(this));
    }

    private setTestMaintainer(maintainer: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId;
                const request = UpdateTestRequest.ofMaintainer(maintainer);
                return this.apiClient.updateTest(this.storage.testRunId, testId, request);
            }
        });
    }

    private async revertTestRegistration() {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId;
                this.storage.testId = null;
                return this.apiClient.revertTestRegistration(this.storage.testRunId, testId);
            }
        });
    }

    private attachTestRunLabels(key: string, values: string[]) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testRunId) {
                const request = AttachLabelsRequest.ofSingleKey(key, values);
                return this.apiClient.attachTestRunLabels(this.storage.testRunId, request);
            }
        });
    }

    private attachTestLabels(key: string, values: string[]) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId;
                const request = AttachLabelsRequest.ofSingleKey(key, values);
                return this.apiClient.attachTestLabels(this.storage.testRunId, testId, request);
            }
        });
    }

    private async attachTestRunArtifactReferences(name: string, value: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testRunId) {
                const request = AttachArtifactReferencesRequest.single(name, value);
                return this.apiClient.attachTestRunArtifactReferences(this.storage.testRunId, request);
            }
        });
    }

    private async attachTestArtifactReferences(name: string, value: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId;
                const request = AttachArtifactReferencesRequest.single(name, value);
                return this.apiClient.attachTestArtifactReferences(this.storage.testRunId, testId, request);
            }
        });
    }

    private async saveScreenshotBuffer(screenshot: Buffer) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId;
                return this.apiClient.uploadTestScreenshot(this.storage.testRunId, testId, screenshot);
            }
        });
    }

    private async addTestCases(testCase: TestCase) {
        if (this.storage.testId) {
            this.storage.addTestTestCase(testCase);
        }
    }

}
