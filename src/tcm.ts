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

    testCase: (testCaseKey: string) => {
        emitAddTestCaseEvent('ZEBRUNNER', testCaseKey);
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('ZEBRUNNER', testCaseKey, resultStatus);
    },

    testCases: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('ZEBRUNNER', testCaseKey));
        }
    },

};

export const testRail = {

    testCase: (testCaseKey: string) => {
        emitAddTestCaseEvent('TEST_RAIL', testCaseKey);
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('TEST_RAIL', testCaseKey, resultStatus);
    },

    testCases: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('TEST_RAIL', testCaseKey));
        }
    },

};

export const xray = {

    testCase: (testCaseKey: string) => {
        emitAddTestCaseEvent('XRAY', testCaseKey);
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('XRAY', testCaseKey, resultStatus);
    },

    testCases: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('XRAY', testCaseKey));
        }
    },

};

export const zephyr = {

    testCase: (testCaseKey: string) => {
        emitAddTestCaseEvent('ZEPHYR', testCaseKey);
    },

    testCaseStatus: (testCaseKey: string, resultStatus: string) => {
        emitAddTestCaseEvent('ZEPHYR', testCaseKey, resultStatus);
    },

    testCases: (...testCaseKeys: string[]) => {
        if (isNotEmptyArray(testCaseKeys)) {
            testCaseKeys.forEach((testCaseKey: string) => emitAddTestCaseEvent('ZEPHYR', testCaseKey));
        }
    },

};
