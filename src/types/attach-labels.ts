import {Label} from "./label"

export class AttachLabelsRequest {

    readonly items: Label[]

    static of(labels: Label[]): AttachLabelsRequest {
        return {items: [...labels]}
    }

    static ofSingleKey(key: string, values: string[]): AttachLabelsRequest {
        return {items: values.map(value => ({key, value}))}
    }

}
