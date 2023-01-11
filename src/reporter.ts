import WDIOReporter, {RunnerStats, TestStats} from '@wdio/reporter'
import {ApiClient} from "./api-client"
import {
    AttachArtifactReferencesRequest,
    AttachLabelsRequest,
    CorrelationData,
    FinishTestRequest,
    LinkTestsAndTestSessionRequest,
    StartTestRequest,
    TestFinishStatus,
    UpdateTestRequest
} from "./types"
import SuiteStats from "@wdio/reporter/build/stats/suite"
import log from 'loglevel'
import {EventNames} from "./constant"
import {Storage} from "./storage"
import {Buffer} from "buffer"
import {LogsManager} from "./logs-manager"

export class ZebrunnerReporter extends WDIOReporter {

    private readonly storage: Storage
    private readonly apiClient: ApiClient
    private readonly logsManager: LogsManager

    private readonly log = log.getLogger('zebrunner')

    private allEventsReportedToZebrunner: boolean = false

    constructor(reporterConfig) {
        super(reporterConfig)

        this.storage = global.zebrunnerReporterStorage
        if (!this.storage || !this.storage.testRunId) {
            throw Error('Cannot initialize ZebrunnerReporter since ZebrunnerService didn\'t perform initialization correctly')
        }

        this.apiClient = this.storage.apiClient
        this.logsManager = new LogsManager(this.storage)

        this.registerActionListeners()
    }

    registerActionListeners() {
        process.on(EventNames.SET_TEST_MAINTAINER, this.setTestMaintainer.bind(this))
        process.on(EventNames.ATTACH_TEST_LABELS, this.attachTestLabels.bind(this))
        process.on(EventNames.ATTACH_TEST_ARTIFACT_REFERENCES, this.attachTestArtifactReferences.bind(this))
        process.on(EventNames.REVERT_TEST_REGISTRATION, this.revertTestRegistration.bind(this))

        process.on(EventNames.SAVE_TEST_SCREENSHOT_BUFFER, this.saveScreenshotBuffer.bind(this))

        process.on(EventNames.ATTACH_TEST_RUN_LABELS, this.attachTestRunLabels.bind(this))
        process.on(EventNames.ATTACH_TEST_RUN_ARTIFACT_REFERENCES, this.attachTestRunArtifactReferences.bind(this))
    }

    get isSynchronised() {
        return this.allEventsReportedToZebrunner
    }

    onSuiteStart(suiteStats: SuiteStats) {
        this.storage.currentSpec = suiteStats.file
    }

    async onTestStart(testStats: TestStats) {
        this.storage.currentTest = testStats

        const spec = this.storage.currentSpec
        const correlationData = new CorrelationData(spec, testStats.fullTitle).stringify()
        const request = new StartTestRequest(testStats, spec, correlationData)

        const testIdToRerun = this.storage.getTestIdToRerun(correlationData)
        this.storage.testId = testIdToRerun
            ? this.apiClient.restartTest(this.storage.testRunId, testIdToRerun, request)
            : this.apiClient.startTest(this.storage.testRunId, request)

        // if test will fail before test session start completes,
        // the following linking request will use wrong test id from storage
        // to avoid this, we need to store the test id into a separate variable
        const testId = this.storage.testId

        return this.storage.trackOperationPromise(async () => {
            // wdio does not wait for this method to complete, so it is better to wait for session first id and only then wait for test id,
            // because browser.reloadSession() can be invoked before the start test request completes
            const testSessionId = await this.storage.testSessionId
            const linkRequest = LinkTestsAndTestSessionRequest.ofSingleTest(await testId)
            return this.apiClient.linkTestsAndTestSession(this.storage.testRunId, testSessionId, linkRequest)
        })
    }

    async onTestPass(testStats: TestStats) {
        return this.onTestFinish(testStats, 'PASSED')
    }

    async onTestFail(testStats: TestStats) {
        return this.onTestFinish(testStats, 'FAILED')
    }

    async onTestSkip(testStats: TestStats) {
        return this.onTestFinish(testStats, 'SKIPPED')
    }

    async onTestFinish(testStats: TestStats, status: TestFinishStatus) {
        const stack: string = testStats.errors?.[0]?.stack
        if (stack) {
            this.log.error(stack)
        }

        return this.storage.trackOperationPromise(async () => {
            const testId = await this.storage.testId
            if (testId) {
                const request = new FinishTestRequest(status, stack)
                return this.apiClient.finishTest(this.storage.testRunId, testId, request)
            }
        })
    }

    async onRunnerEnd(runStats: RunnerStats) {
        await this.logsManager.close()
        await this.storage.allPromises()

        this.allEventsReportedToZebrunner = true
    }

    private setTestMaintainer(maintainer: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId
                const request = UpdateTestRequest.ofMaintainer(maintainer)
                return this.apiClient.updateTest(this.storage.testRunId, testId, request)
            }
        })
    }

    private attachTestRunLabels(key: string, values: string[]) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const request = AttachLabelsRequest.ofSingleKey(key, values)
                return this.apiClient.attachTestRunLabels(this.storage.testRunId, request)
            }
        })
    }

    private attachTestLabels(key: string, values: string[]) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId
                const request = AttachLabelsRequest.ofSingleKey(key, values)
                return this.apiClient.attachTestLabels(this.storage.testRunId, testId, request)
            }
        })
    }

    private async attachTestRunArtifactReferences(name: string, value: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const request = AttachArtifactReferencesRequest.single(name, value)
                return this.apiClient.attachTestRunArtifactReferences(this.storage.testRunId, request)
            }
        })
    }

    private async attachTestArtifactReferences(name: string, value: string) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId
                const request = AttachArtifactReferencesRequest.single(name, value)
                return this.apiClient.attachTestArtifactReferences(this.storage.testRunId, testId, request)
            }
        })
    }

    private async saveScreenshotBuffer(screenshot: Buffer) {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId
                return this.apiClient.uploadTestScreenshot(this.storage.testRunId, testId, screenshot)
            }
        })
    }

    private async revertTestRegistration() {
        return this.storage.trackOperationPromise(async () => {
            if (this.storage.testId) {
                const testId = await this.storage.testId
                this.storage.testId = null
                return this.apiClient.revertTestRegistration(this.storage.testRunId, testId)
            }
        })
    }

}
