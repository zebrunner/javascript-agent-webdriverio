export class UpdateTestRequest {

    constructor(private maintainer?: string) {
    }

    static ofMaintainer(maintainer: string): UpdateTestRequest {
        return new UpdateTestRequest(maintainer);
    }

}
