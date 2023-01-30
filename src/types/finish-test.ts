export type TestFinishStatus = 'PASSED' | 'FAILED' | 'ABORTED' | 'SKIPPED'

export class FinishTestRequest {

    result: TestFinishStatus;
    reason?: string;
    endedAt: Date;

    constructor(result: TestFinishStatus, reason?: string) {
        this.result = result;
        this.reason = reason;
        this.endedAt = new Date();
    }

}
