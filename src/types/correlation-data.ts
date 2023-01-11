export class CorrelationData {

    spec: string
    fullTitle: string

    constructor(spec: string,
                fullTitle: string) {
        this.spec = spec
        this.fullTitle = fullTitle
    }

    stringify(): string {
        return JSON.stringify(this)
    }

    static parse(string: string): CorrelationData {
        const parsedObject: any = JSON.parse(string)
        return new CorrelationData(parsedObject.spec, parsedObject.fullTitle)
    }

}
