const urls = {
  URL_REFRESH: '/api/iam/v1/auth/refresh',
  URL_REGISTER_RUN: '/api/reporting/v1/test-runs?projectKey=${project}',
  URL_FINISH_RUN: '/api/reporting/v1/test-runs/',
  URL_START_TEST: '/api/reporting/v1/test-runs/${testRunId}/tests',
  URL_FINISH_TEST: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}',
  URL_SEND_LOGS: '/api/reporting/v1/test-runs/${testRunId}/logs',
  URL_SEND_SCREENSHOT: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/screenshots',
  URL_SET_RUN_LABELS: '/api/reporting/v1/test-runs/${testRunId}/labels',
  URL_SET_TEST_LABELS: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/labels',
  URL_START_SESSION: '/api/reporting/v1/test-runs/${testRunId}/test-sessions',
  URL_UPDATE_SESSION: '/api/reporting/v1/test-runs/${testRunId}/test-sessions/${testSessionId}',
  URL_SEND_RUN_ARTIFACTS: '/api/reporting/v1/test-runs/${testRunId}/artifacts',
  URL_SEND_TEST_ARTIFACTS: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/artifacts',
  URL_SEND_RUN_ARTIFACT_REFERENCES: '/api/reporting/v1/test-runs/${testRunId}/artifact-references',
  URL_SEND_TEST_ARTIFACT_REFERENCES: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/artifact-references',
  URL_SEND_SESSION_ARTIFACTS: '/api/reporting/v1/test-runs/${testRunId}/test-sessions/${testSessionId}/artifacts',
  URL_REVERT_TEST_REGISTRATION: '/api/reporting/v1/test-runs/${testRunId}/tests/${testId}',
};

const testrailLabels = {
  SYNC_ENABLED: 'com.zebrunner.app/tcm.testrail.sync.enabled',
  SYNC_REAL_TIME: 'com.zebrunner.app/tcm.testrail.sync.real-time',
  INCLUDE_ALL: 'com.zebrunner.app/tcm.testrail.include-all-cases',
  SUITE_ID: 'com.zebrunner.app/tcm.testrail.suite-id',
  RUN_ID: 'com.zebrunner.app/tcm.testrail.run-id',
  RUN_NAME: 'com.zebrunner.app/tcm.testrail.run-name',
  MILESTONE: 'com.zebrunner.app/tcm.testrail.milestone',
  ASSIGNEE: 'com.zebrunner.app/tcm.testrail.assignee',
  CASE_ID: 'com.zebrunner.app/tcm.testrail.case-id',
}

const xrayLabels = {
  SYNC_ENABLED: 'com.zebrunner.app/tcm.xray.sync.enabled',
  SYNC_REAL_TIME: 'com.zebrunner.app/tcm.xray.sync.real-time',
  EXECUTION_KEY: 'com.zebrunner.app/tcm.xray.test-execution-key',
  TEST_KEY: 'com.zebrunner.app/tcm.xray.test-key',
}

const zephyrLabels = {
  SYNC_ENABLED: 'com.zebrunner.app/tcm.zephyr.sync.enabled',
  SYNC_REAL_TIME: 'com.zebrunner.app/tcm.zephyr.sync.real-time',
  TEST_CYCLE_KEY: 'com.zebrunner.app/tcm.zephyr.test-cycle-key',
  JIRA_PROJECT_KEY: 'com.zebrunner.app/tcm.zephyr.jira-project-key',
  TEST_CASE_KEY: 'com.zebrunner.app/tcm.zephyr.test-case-key',
}

const commonHeaders = {
  jsonHeaders: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  imageHeaders: {
    headers: {
      'Content-Type': 'image/png',
    },
  },
  multipartDataHeaders: {
    headers: {
      'Accept': '*/*',
    },
  },
};

const logLevels = {
  fatal: 'FATAL',
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
  debug: 'DEBUG',
  trace: 'TRACE',
  all: 'ALL',
};

const emitterCommands = {
  SET_MAINTAINER: 'SET_MAINTAINER',
  SET_RUN_LABELS: 'SET_RUN_LABELS',
  SET_TEST_LABELS: 'SET_TEST_LABELS',
  SET_RUN_TCM_OPTIONS: 'SET_RUN_TCM_OPTIONS',
  SET_TEST_TCM_OPTIONS: 'SET_TEST_TCM_OPTIONS',
  ATTACH_TO_TEST_RUN: 'ATTACH_TO_TEST_RUN',
  ATTACH_REF_TO_TEST_RUN: 'ATTACH_REF_TO_TEST_RUN',
  ATTACH_TO_TEST: 'ATTACH_TO_TEST',
  ATTACH_REF_TO_TEST: 'ATTACH_REF_TO_TEST',
  SET_TEST_LOGS: 'SET_TEST_LOGS',
  REVERT_TEST_REGISTRATION: 'REVERT_TEST_REGISTRATION',
}

export {
  urls,
  testrailLabels,
  xrayLabels,
  zephyrLabels,
  commonHeaders,
  logLevels,
  emitterCommands,
};