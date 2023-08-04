import { TestStats } from '@wdio/reporter';

export class StartTestRequest {

    name: string;
    className: string;
    methodName: string;
    argumentsIndex?: number;
    startedAt: Date;
    maintainer?: string;
    correlationData?: string;
    testGroups: string[];

    constructor(testStats: TestStats, spec: string, correlationData: string, testGroups: string[]) {
        this.name = testStats.fullTitle;
        this.className = spec;
        this.methodName = testStats.title;
        this.startedAt = new Date();
        this.correlationData = correlationData;
        this.testGroups = testGroups;
    }

}
