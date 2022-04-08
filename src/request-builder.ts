import {BrowserCapabilities, ReporterConfig, RunOptions} from './types/index';
import {RunnerStats, SuiteStats, TestStats} from '@wdio/reporter';
import {v4 as uuidv4} from 'uuid';

const getRefreshToken = (token: string) => {
  return {
    refreshToken: token,
  };
};

const getTestRunStart = (suite: RunnerStats, reporterConfig: ReporterConfig) => {
  let testRunStartBody = {
    uuid: uuidv4(),
    name: reporterConfig.reportingRunDisplayName
      ? reporterConfig.reportingRunDisplayName
      : 'Default suite',
    startedAt: suite.start,
    framework: 'wdio',
    config: {
      environment: reporterConfig.reportingRunEnvironment
        ? reporterConfig.reportingRunEnvironment
        : '-',
      build: reporterConfig.reportingRunBuild ? reporterConfig.reportingRunBuild : '',
    },
    milestone: {
      id: reporterConfig.reportingMilestoneId ? reporterConfig.reportingMilestoneId : null,
      name: reporterConfig.reportingMilestoneName ? reporterConfig.reportingMilestoneName : null,
    },
    notifications: {
      notifyOnEachFailure: reporterConfig.reportingNotifyOnEachFailure,
      targets: [],
    },
  };

  Object.keys(reporterConfig).forEach((key) => {
    if (key === 'reportingNotificationSlackChannels') {
      testRunStartBody.notifications.targets.push({
        type: 'SLACK_CHANNELS',
        value: reporterConfig[key],
      });
    }
    if (key === 'reportingNotificationMsTeamsChannels') {
      testRunStartBody.notifications.targets.push({
        type: 'MS_TEAMS_CHANNELS',
        value: reporterConfig[key],
      });
    }
    if (key === 'reportingNotificationEmails') {
      testRunStartBody.notifications.targets.push({
        type: 'EMAIL_RECIPIENTS',
        value: reporterConfig[key],
      });
    }
  });
  return testRunStartBody;
};

const getTestRunEnd = (test: TestStats) => {
  return {
    endedAt: test.end,
  };
};

const getTestStart = (test: TestStats, maintainer) => {
  let testStartBody = {
    name: test.title,
    startedAt: test.start,
    className: test.fullTitle,
    maintainer: maintainer ? maintainer : 'anonymous',
    methodName: test.title,
  };

  return testStartBody;
};

const getTestEnd = (test: TestStats) => {
  return {
    endedAt: test.end,
    result: test.state.toUpperCase(),
  };
};

const getTestSessionStart = (
  testStats: TestStats,
  testId: string,
  capabilities: BrowserCapabilities
) => {
  return {
    sessionId: uuidv4(),
    initiatedAt: testStats.start,
    startedAt: testStats.start,
    capabilities: capabilities ? capabilities : 'n/a',
    desiredCapabilities: capabilities ? capabilities : 'n/a',
    testIds: [testId],
  };
};

const getTestSessionEnd = (testStats: TestStats, testId: string) => {
  return {
    endedAt: testStats.end,
    testIds: [testId],
  };
};

const getTestRunLabels = (reporterOptions: ReporterConfig, options: RunOptions) => {
  const testRunLabelsBody = {
    items: [],
  };

  if (reporterOptions.reportingRunLocale) {
    testRunLabelsBody.items.push({
      key: 'com.zebrunner.app/sut.locale',
      value: reporterOptions.reportingRunLocale,
    });
  }

  if (options.tcmConfig) {
    Object.keys(options.tcmConfig).forEach((el) => {
      Object.keys(options.tcmConfig[el]).forEach((key) => {
        testRunLabelsBody.items.push(options.tcmConfig[el][key]);
      });
    });
  }

  if (options.labels.length > 0) {
    const labels = options.labels.flat();
    labels.forEach((el) => {
      testRunLabelsBody.items.push(el);
    });
  }

  return testRunLabelsBody;
};

const getTestLabels = (labels, tcmOptions) => {
  const obj = {
    items: [],
  };

  if (tcmOptions && tcmOptions.length > 0) {
    tcmOptions.forEach((tcmOption) => {
      obj.items.push(tcmOption);
    });
  }

  if (labels && labels.length > 0) {
    const flatLabels = labels.flat();
    flatLabels.forEach((label) => {
      obj.items.push(label);
    });
  }

  return obj;
};

export {
  getRefreshToken,
  getTestRunStart,
  getTestRunEnd,
  getTestStart,
  getTestEnd,
  getTestSessionStart,
  getTestSessionEnd,
  getTestRunLabels,
  getTestLabels,
};
