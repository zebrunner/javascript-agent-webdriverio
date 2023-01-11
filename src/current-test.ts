import {EventNames} from "./constant"
import {Buffer} from "buffer"
import {isBuffer, isFunction, isNotBlankString, isNotEmptyArray, isPromise} from "./type-utils"
import log from "loglevel"

const logger = log.getLogger('zebrunner')

export const currentTest = {

    setMaintainer: (maintainer) => {
        if (!isNotBlankString(maintainer)) {
            logger.warn(`Maintainer must a not blank string. Provided value is '${maintainer}'`)
        }

        (process.emit as Function)(EventNames.SET_TEST_MAINTAINER, maintainer)
    },

    attachLabel: (key: string, ...values: string[]) => {
        if (!isNotBlankString(key)) {
            logger.warn(`Label key must be a not blank string. Provided value is '${key}'`)
            return
        }
        if (!isNotEmptyArray(values)) {
            logger.warn(`You must provide at least one label value. The label with the key '${key}' has none`)
            return
        }

        values = values.filter(value => {
            const isNotBlank = isNotBlankString(value)
            if (!isNotBlank) {
                logger.warn(`Label value must be a not blank string. Provided value for key '${key}' is '${value}'`)
            }
            return isNotBlank
        })

        if (isNotEmptyArray(values)) {
            (process.emit as Function)(EventNames.ATTACH_TEST_LABELS, key, values)
        }
    },

    attachArtifactReference: (name: string, value: string) => {
        if (!isNotBlankString(name)) {
            logger.warn(`Artifact reference name must be a not blank string. Provided value is '${name}'`)
            return
        }
        if (!isNotBlankString(value)) {
            logger.warn(`Artifact reference value must be a not blank string. Provided value for name '${value}' is '${value}'`)
            return
        }

        (process.emit as Function)(EventNames.ATTACH_TEST_ARTIFACT_REFERENCES, name, value)
    },

    // uploadArtifact: (name: string, content: Buffer) => {
    //     (process.emit as Function)(ActionNames.UPLOAD_TEST_ARTIFACT_BUFFER, name, content)
    // },

    async saveScreenshot(browserOrScreenshot) {
        let screenshot = browserOrScreenshot

        if (isFunction(browserOrScreenshot?.takeScreenshot)) {
            screenshot = browserOrScreenshot.takeScreenshot()
        }

        if (isPromise(screenshot)) {
            screenshot = await screenshot
        }

        if (isNotBlankString(screenshot)) {
            screenshot = Buffer.from(screenshot, 'base64')
        }

        if (isBuffer(screenshot)) {
            (process.emit as Function)(EventNames.SAVE_TEST_SCREENSHOT_BUFFER, screenshot)
        } else {
            logger.warn('Provided value to save screenshot is not valid. ' +
                'It must be either a browser object, or a Promise, or a base64-encoded string, or a Buffer')
        }
    },

    revertRegistration: () => {
        (process.emit as Function)(EventNames.REVERT_TEST_REGISTRATION)
    }

}
