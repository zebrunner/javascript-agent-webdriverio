export type TestSessionStartStatus = 'RUNNING' | 'FAILED'

export class StartTestSessionRequest {

    sessionId?: string;
    initiatedAt: Date;
    startedAt?: Date;
    failureReason?: string;
    status: TestSessionStartStatus;
    desiredCapabilities: any;
    capabilities: any;
    testIds?: number[];

    static running(browser: any, desiredCapabilities: any, testId?: number): StartTestSessionRequest {
        return {
            sessionId: browser.sessionId,
            initiatedAt: new Date(),
            startedAt: new Date(),
            status: 'RUNNING',
            desiredCapabilities,
            capabilities: browser.capabilities,
            testIds: testId ? [testId] : null,
        };
    }

    static failed(desiredCapabilities: any): StartTestSessionRequest {
        return {
            initiatedAt: new Date(),
            status: 'FAILED',
            desiredCapabilities,
            capabilities: {},
        };
    }

}
