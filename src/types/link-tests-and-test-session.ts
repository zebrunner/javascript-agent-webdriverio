export class LinkTestsAndTestSessionRequest {

    constructor(private testIds: number[]) {
    }

    static ofSingleTest(testId: number): LinkTestsAndTestSessionRequest {
        return new LinkTestsAndTestSessionRequest([testId]);
    }

}
