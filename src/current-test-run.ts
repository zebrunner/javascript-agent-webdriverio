import log from 'loglevel';
import { EventNames } from './constant';
import { isNotBlankString, isNotEmptyArray } from './type-utils';

const logger = log.getLogger('zebrunner');

export const currentTestRun = {
    attachLabel: (key: string, ...values: string[]) => {
        if (!isNotBlankString(key)) {
            logger.warn(`Label key must be a not blank string. Provided value is '${key}'`);
            return;
        }
        if (!isNotEmptyArray(values)) {
            logger.warn(`You must provide at least one label value. The label with the key '${key}' has none`);
            return;
        }

        values = values.filter((value) => {
            const isNotBlank = isNotBlankString(value);
            if (!isNotBlank) {
                logger.warn(`Label value must be a not blank string. Provided value for key '${key}' is '${value}'`);
            }
            return isNotBlank;
        });

        if (isNotEmptyArray(values)) {
            (process.emit as Function)(EventNames.ATTACH_TEST_RUN_LABELS, key, values);
        }
    },

    attachArtifactReference: (name: string, value: string) => {
        if (!isNotBlankString(name)) {
            logger.warn(`Artifact reference name must be a not blank string. Provided value is '${name}'`);
            return;
        }
        if (!isNotBlankString(value)) {
            logger.warn(`Artifact reference value must be a not blank string. Provided value for name '${value}' is '${value}'`);
            return;
        }

        (process.emit as Function)(EventNames.ATTACH_TEST_RUN_ARTIFACT_REFERENCES, name, value);
    },

};
