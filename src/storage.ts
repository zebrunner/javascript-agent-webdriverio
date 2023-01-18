import { TestStats } from '@wdio/reporter';
import { CorrelationData, Test } from './types';
import { ReportingConfig } from './reporting-config';
import { ApiClient } from './api-client';

export class Storage {
    private static ZEBRUNNER_RUN_ID = 'ZEBRUNNER_RUN_ID';

    // in order to decrease the amount of refresh token requests, the api client should be forwarded using the storage
    readonly apiClient: ApiClient;

    readonly reportingConfig: ReportingConfig;

    private specsToRerun: Set<string> = null;

    private correlationDataToTestIdToRerun: Map<string, number> = null;

    private _currentSpec: string;

    currentTest: TestStats;

    private readonly promises: Promise<any>[] = [];

    private _testId: Promise<number>;

    private _testSessionId: Promise<number>;

    constructor(reportingConfig: ReportingConfig) {
        this.apiClient = new ApiClient(reportingConfig);
        this.reportingConfig = reportingConfig;
    }

    setupRerunData(testsToRerun: Test[], allTests: Test[]): void {
        this.specsToRerun = new Set();
        this.correlationDataToTestIdToRerun = new Map();

        testsToRerun
            .map((testToRerun) => CorrelationData.parse(testToRerun.correlationData))
            .forEach((correlationData) => this.specsToRerun.add(correlationData.spec));

        allTests.forEach((test) => {
            const correlationData: CorrelationData = CorrelationData.parse(test.correlationData);
            if (this.specsToRerun.has(correlationData.spec)) {
                this.correlationDataToTestIdToRerun.set(test.correlationData, test.id);
            }
        });
    }

    isSpecToRerun(spec: string): boolean {
        return !this.specsToRerun || this.specsToRerun.has(Storage.normalizeSpec(spec));
    }

    getTestIdToRerun(correlationData: string): number {
        if (this.correlationDataToTestIdToRerun) {
            return this.correlationDataToTestIdToRerun.get(correlationData);
        }
    }

    get testRunId(): number {
        return parseInt(process.env[Storage.ZEBRUNNER_RUN_ID], 10);
    }

    set testRunId(testRunId: number) {
        process.env[Storage.ZEBRUNNER_RUN_ID] = testRunId.toString();
    }

    get currentSpec(): string {
        return this._currentSpec;
    }

    set currentSpec(currentSpec: string) {
        this._currentSpec = Storage.normalizeSpec(currentSpec);
    }

    private static normalizeSpec(spec: string): string {
        const workingDirectory = process.cwd();
        if (spec.startsWith(workingDirectory)) {
            spec = spec.slice(process.cwd().length + 1);
        }
        return spec;
    }

    get testId(): Promise<number> {
        return this._testId;
    }

    set testId(testId: Promise<number>) {
        this._testId = testId;
        this.promises.push(testId);
    }

    get testSessionId(): Promise<number> {
        return this._testSessionId;
    }

    set testSessionId(testSessionId: Promise<number>) {
        this._testSessionId = testSessionId;
        this.promises.push(testSessionId);
    }

    async trackOperationPromise(operation: () => Promise<any>) {
        const operationResult = { resolve: null, reject: null };
        const promise = new Promise((resolve, reject) => {
            operationResult.resolve = resolve;
            operationResult.reject = reject;
        });
        this.promises.push(promise);

        try {
            const result = await operation();
            operationResult.resolve(true);
            return result;
        } catch (e) {
            operationResult.reject(false);
        }
    }

    allPromises(): Promise<any> {
        return Promise.allSettled(this.promises);
    }
}
