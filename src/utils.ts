import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import {logLevels, testrailLabels, xrayLabels, zephyrLabels} from './constants';

const getBrowserCapabilities = (suiteStats) => ({
  browserName: suiteStats.capabilities.browserName,
  browserVersion: suiteStats.capabilities.browserVersion,
  platformName: suiteStats.capabilities.platformName,
});

function logObject(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

function getObjectAsString(obj) {
  return JSON.stringify(obj, null, 2);
}

const parseDate = (date) => {
  const parseDate = new Date(`${date}`);
  const seconds = _addZero(parseDate.getSeconds());
  const minutes = _addZero(parseDate.getMinutes());
  const hours = _addZero(parseDate.getHours());
  const day = _addZero(parseDate.getDate());
  const month = _addZero(parseDate.getMonth() + 1);
  const year = parseDate.getFullYear();

  return `[${hours}:${minutes}:${seconds} ${year}-${month}-${day}]`;
};

const _addZero = (value) => {
  return value < 10 ? `0${value}` : value;
};

const getTestArtifacts = (attach) => {
  const arr = [];
  const dir = path.resolve('artifacts');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);

    files.forEach((el) => {
      if (attach.includes(el)) {
        const filePath = path.join(dir, el);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        arr.push(formData);
      }
    });
    return arr;
  } else {
    return null;
  }
};

const getArtifactReferences = (references) => {
  const array = references.reduce((acc, el) => [...acc, {name: el[0], value: el[1]}], []);
  return {items: array};
};

const getVideoAttachments = async (title, parent) => {
  const roughlyFileName = `${parent.replace(/ /g, '-')}--${title.replace(/ /g, '-')}`;
  const videosFolder = _resolvePath(['videos']);
  let videoName;

  if (fs.existsSync(videosFolder)) {
    fs.readdirSync(videosFolder).forEach((file) => {
      if (file.includes(roughlyFileName)) {
        videoName = file;
      }
    });

    const videoPath = _resolvePath(['videos', videoName]);
    const formData = new FormData();
    const stream = fs.createReadStream(videoPath);

    stream.on('error', (err) => console.log(err));
    formData.append('video', stream);

    return {formData, videoPath};
  } else {
    return {formData: null};
  }
};

const getScreenshotAttachments = (title, parent) => {
  const roughlyFileName = `${parent.replace(/ /g, '-')}--${title.replace(/ /g, '-')}`;
  const folder = _resolvePath(['videos', 'rawSeleniumVideoGrabs']);
  let screenshotFolder;
  const screenshots = [];
  if (fs.existsSync(folder)) {
    fs.readdirSync(folder).forEach((file) => {
      if (file.includes(roughlyFileName)) {
        screenshotFolder = file;
      }
    });

    fs.readdirSync(_resolvePath(['videos', 'rawSeleniumVideoGrabs', screenshotFolder])).forEach(
      (file) => {
        const bufferImg = fs.readFileSync(
          _resolvePath(['videos', 'rawSeleniumVideoGrabs', screenshotFolder, file])
        );
        screenshots.push(bufferImg);
      }
    );

    return screenshots;
  } else {
    return null;
  }
};

const getFileSizeInBytes = (filename) => {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  console.log('size', fileSizeInBytes);
  return fileSizeInBytes;
};

const _resolvePath = (filePath) => {
  const paths = [...filePath];
  return path.resolve(...paths);
};

const parseTcmRunOptions = (data) => {
  const tcmConfig = {
    xray:
      {
        executionKey: {
          key: xrayLabels.EXECUTION_KEY,
          value: '',
        },
        disableSync: {
          key: xrayLabels.SYNC_ENABLED,
          value: true,
        },
        enableRealTimeSync: {
          key: xrayLabels.SYNC_REAL_TIME,
          value: false,
        },
      } || {},
    testRail:
      {
        suiteId: {
          key: testrailLabels.SUITE_ID,
          value: '',
        },
        runId: {
          key: testrailLabels.RUN_ID,
          value: '',
        },
        runName: {
          key: testrailLabels.RUN_NAME,
          value: '',
        },
        milestone: {
          key: testrailLabels.MILESTONE,
          value: '',
        },
        assignee: {
          key: testrailLabels.ASSIGNEE,
          value: '',
        },
        enableSync: {
          key: testrailLabels.SYNC_ENABLED,
          value: true,
        },
        includeAllTestCasesInNewRun: {
          key: testrailLabels.INCLUDE_ALL,
          value: false,
        },
        enableRealTimeSync: {
          key: testrailLabels.SYNC_REAL_TIME,
          value: false,
        },
      } || {},
    zephyr:
      {
        testCycleKey: {
          key: zephyrLabels.TEST_CYCLE_KEY,
          value: '',
        },
        jiraProjectKey: {
          key: zephyrLabels.JIRA_PROJECT_KEY,
          value: '',
        },
        enableSync: {
          key: zephyrLabels.SYNC_ENABLED,
          value: true,
        },
        enableRealTimeSync: {
          key: zephyrLabels.SYNC_REAL_TIME,
          value: false,
        },
      } || {},
  };
  data.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key === 'xrayExecutionKey') {
        tcmConfig.xray.executionKey.value = obj[key];
      }
      if (key === 'xrayDisableSync') {
        tcmConfig.xray.disableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'xrayEnableRealTimeSync') {
        tcmConfig.xray.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
      }

      if (key === 'testRailSuiteId') {
        tcmConfig.testRail.suiteId.value = obj[key];
      }
      if (key === 'testRailRunId') {
        tcmConfig.testRail.runId.value = obj[key];
      }
      if (key === 'testRailRunName') {
        tcmConfig.testRail.runName.value = obj[key];
      }
      if (key === 'testRailMilestone') {
        tcmConfig.testRail.milestone.value = obj[key];
      }
      if (key === 'testRailAssignee') {
        tcmConfig.testRail.runName.value = obj[key];
      }
      if (key === 'testRailDisableSync') {
        tcmConfig.testRail.enableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'testRailIncludeAll') {
        tcmConfig.testRail.includeAllTestCasesInNewRun.value = JSON.parse(`${obj[key]}`);
      }
      if (key === 'testRailEnableRealTimeSync') {
        tcmConfig.testRail.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
        tcmConfig.testRail.includeAllTestCasesInNewRun.value = JSON.parse(`${obj[key]}`);
      }

      if (key === 'zephyrTestCycleKey') {
        tcmConfig.zephyr.testCycleKey.value = obj[key];
      }
      if (key === 'zephyrJiraProjectKey') {
        tcmConfig.zephyr.jiraProjectKey.value = obj[key];
      }
      if (key === 'zephyrDisableSync') {
        tcmConfig.zephyr.enableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'zephyrEnableRealTimeSync') {
        tcmConfig.zephyr.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
      }
    });
  });

  Object.keys(tcmConfig).forEach((item) => {
    Object.keys(tcmConfig[item]).forEach((key) => {
      if (tcmConfig[item][key].value === '') {
        delete tcmConfig[item][key];
      }
    });
  });

  if (!tcmConfig.xray?.executionKey?.value) {
    tcmConfig.xray = {};
  }
  if (!tcmConfig.testRail?.suiteId?.value) {
    tcmConfig.testRail = {};
  }
  if (!tcmConfig.zephyr?.jiraProjectKey?.value || !tcmConfig.zephyr?.testCycleKey?.value) {
    tcmConfig.zephyr = {};
  }
  return tcmConfig;
};

const parseTcmTestOptions = (data, tcmConfig) => {
  const filterTcm = data.filter((el) => {
    if (el.xrayTestKey) {
      if (tcmConfig.xray?.executionKey?.value) {
        return !!el.xrayTestKey.length;
      }
    }
    if (el.testRailCaseId) {
      if (tcmConfig.testRail?.suiteId?.value) {
        return !!el.testRailCaseId.length;
      }
    }
    if (el.zephyrTestCaseKey) {
      if (tcmConfig.zephyr?.jiraProjectKey?.value && tcmConfig.zephyr?.testCycleKey?.value) {
        return !!el.zephyrTestCaseKey.length;
      }
    }
  });
  return filterTcm
    .map((option) => {
      if (option.xrayTestKey) {
        return option.xrayTestKey.map((value) => {
          return {
            key: xrayLabels.TEST_KEY,
            value,
          };
        });
      }
      if (option.testRailCaseId) {
        return option.testRailCaseId.map((value) => {
          return {
            key: testrailLabels.CASE_ID,
            value,
          };
        });
      }
      if (option.zephyrTestCaseKey) {
        return option.zephyrTestCaseKey.map((value) => {
          return {
            key: zephyrLabels.TEST_CASE_KEY,
            value,
          };
        });
      }
    })
    .flat();
};

const parseLabels = (labels) => {
  const arr = [];
  Object.keys(labels).forEach((key) => {
    arr.push({key: key, value: labels[key]});
  });
  return arr;
};

const parseLogs = (logs, level) => {
  return logs.map((el) => ({message: el, level: logLevels[level], timestamp: Date.now()}));
};

const deleteVideoFolder = () => {
  const folderPath = path.resolve('videos');
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, {recursive: true});
  }
};

const parseWdioConfig = (config) => {
  const wdioConfig = {
    enabled: process.env.REPORTING_ENABLED ? JSON.parse(process.env.REPORTING_ENABLED) : false,
    reportingServerHostname: process.env.REPORTING_SERVER_HOSTNAME,
    reportingProjectKey: process.env.REPORTING_PROJECT_KEY,
    reportingRunDisplayName: process.env.REPORTING_RUN_DISPLAY_NAME,
    reportingRunBuild: process.env.REPORTING_RUN_BUILD,
    reportingRunEnvironment: process.env.REPORTING_RUN_ENVIRONMENT,
    reportingNotifyOnEachFailure: process.env.REPORTING_NOTIFY_ON_EACH_FAILURE
      ? JSON.parse(process.env.REPORTING_NOTIFY_ON_EACH_FAILURE)
      : false,
    reportingNotificationSlackChannels: process.env.REPORTING_NOTIFICATION_SLACK_CHANNELS,
    reportingNotificationMsTeamsChannels: process.env.REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS,
    reportingNotificationEmails: process.env.REPORTING_NOTIFICATION_EMAILS,
    reportingMilestoneId: process.env.REPORTING_MILESTONE_ID,
    reportingMilestoneName: process.env.REPORTING_MILESTONE_NAME,
    reportingRunLocale: process.env.REPORTING_RUN_LOCALE,
  };

  Object.keys(config).forEach((key) => {
    if (key === 'enabled') {
      wdioConfig.enabled = _getConfigVar('ENABLED', config[key]);
    }
    if (key === 'reportingServerHostname') {
      wdioConfig.reportingServerHostname = _getConfigVar('REPORTING_SERVER_HOSTNAME', config[key]);
    }
    if (key === 'reportingProjectKey') {
      wdioConfig.reportingProjectKey = _getConfigVar('REPORTING_PROJECT_KEY', config[key]);
    }
    if (key === 'reportingRunDisplayName') {
      wdioConfig.reportingRunDisplayName = _getConfigVar('REPORTING_RUN_DISPLAY_NAME', config[key]);
    }
    if (key === 'reportingRunBuild') {
      wdioConfig.reportingRunBuild = _getConfigVar('REPORTING_RUN_BUILD', config[key]);
    }
    if (key === 'reportingRunEnvironment') {
      wdioConfig.reportingRunEnvironment = _getConfigVar('REPORTING_RUN_ENVIRONMENT', config[key]);
    }
    if (key === 'reportingNotifyOnEachFailure') {
      wdioConfig.reportingNotifyOnEachFailure = _getConfigVar(
        'REPORTING_NOTIFY_ON_EACH_FAILURE',
        config[key]
      );
    }
    if (key === 'reportingNotificationSlackChannels') {
      wdioConfig.reportingNotificationSlackChannels = _getConfigVar(
        'REPORTING_NOTIFICATION_SLACK_CHANNELS',
        config[key]
      );
    }
    if (key === 'reportingNotificationMsTeamsChannels') {
      wdioConfig.reportingNotificationMsTeamsChannels = _getConfigVar(
        'REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS',
        config[key]
      );
    }
    if (key === 'reportingNotificationEmails') {
      wdioConfig.reportingNotificationEmails = _getConfigVar(
        'REPORTING_NOTIFICATION_EMAILS',
        config[key]
      );
    }
    if (key === 'reportingMilestoneId') {
      wdioConfig.reportingMilestoneId = _getConfigVar('REPORTING_MILESTONE_ID', config[key]);
    }
    if (key === 'reportingMilestoneName') {
      wdioConfig.reportingMilestoneName = _getConfigVar('REPORTING_MILESTONE_NAME', config[key]);
    }
    if (key === 'reportingRunLocale') {
      wdioConfig.reportingRunLocale = _getConfigVar('REPORTING_RUN_LOCALE', config[key]);
    }
  });

  Object.keys(wdioConfig).forEach((key) => {
    if (wdioConfig[key] === '' || wdioConfig[key] === undefined) {
      delete wdioConfig[key];
    }
  });

  return wdioConfig;
};

const _getConfigVar = (envVarName, configVar) => {
  if (!!process.env[envVarName]) {
    return process.env[envVarName];
  } else if (configVar || configVar === false) {
    return configVar;
  } else {
    return undefined;
  }
};

export {
  logObject,
  getObjectAsString,
  parseDate,
  getBrowserCapabilities,
  getTestArtifacts,
  getArtifactReferences,
  getVideoAttachments,
  getScreenshotAttachments,
  getFileSizeInBytes,
  parseTcmRunOptions,
  parseTcmTestOptions,
  parseLabels,
  parseLogs,
  deleteVideoFolder,
  parseWdioConfig,
};
