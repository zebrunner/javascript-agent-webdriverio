import { isNotBlankString, isNotEmptyArray } from './type-utils';
import log from 'loglevel';
import { EventNames } from './constant';
import { TcmType, TestCase } from './types';

const logger = log.getLogger('zebrunner');

const emitAddTestCaseEvent = (tcmType: TcmType, testCaseKey: string, resultStatus?: string) => {
    if (isNotBlankString(testCaseKey)) {
        const testCase: TestCase = {
            tcmType: tcmType,
            testCaseId: testCaseKey,
            resultStatus: resultStatus
        };

        (process.emit as Function)(EventNames.ADD_TEST_CASE, testCase);
    } else {
        logger.warn(`Test Case key must be a not blank string. Provided value is '${testCaseKey}'`);
    }
};

export const zebrunner = {

    testCaseKey: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('ZEBRUNNER', testCaseKey));
        }
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('ZEBRUNNER', testCaseKey, resultStatus);
    },

};

const emitTestRailAddTestCaseEvent = (testCaseId: string, resultStatus?: string) => {
    if (isNotBlankString(testCaseId) && testCaseId.startsWith('C')) {
        testCaseId = testCaseId.substring(1);
    }
    emitAddTestCaseEvent('TEST_RAIL', testCaseId, resultStatus);
};

export const testRail = {

    testCaseId: (...testCaseIds: string[]) => {
        if (isNotEmptyArray(testCaseIds)) {
            testCaseIds.forEach((testCaseId: string) => emitTestRailAddTestCaseEvent(testCaseId));
        }
    },

    testCaseStatus: (testCaseId: string, resultStatus: string) => {
        emitTestRailAddTestCaseEvent(testCaseId, resultStatus);
    },

};

export const xray = {

    testCaseKey: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('XRAY', testCaseKey));
        }
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('XRAY', testCaseKey, resultStatus);
    },

};

export const zephyr = {

    testCaseKey: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('ZEPHYR', testCaseKey));
        }
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('ZEPHYR', testCaseKey, resultStatus);
    },

};
