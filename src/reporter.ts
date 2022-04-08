import WDIOReporter, {RunnerStats, TestStats} from '@wdio/reporter';
import ZebrunnerApiClient from './zebr-api-client';
import {
  parseDate,
  getBrowserCapabilities,
  parseTcmRunOptions,
  parseTcmTestOptions,
  parseLabels,
  deleteVideoFolder,
  parseWdioConfig,
} from './utils';
import {emitterCommands} from './constants';
import {BrowserCapabilities, ReporterConfig, RunOptions, TestOptions} from './types';
export class ZebrunnerReporter extends WDIOReporter {
  private reporterConfig: ReporterConfig;
  private zebrunnerApiClient;
  private browserCapabilities: BrowserCapabilities;
  private syncReporting: boolean;
  private runOptions: RunOptions;
  private testStats: TestStats[];
  private testUid: string;
  private currentTestOptions: TestOptions;
  constructor(reporterConfig) {
    super(reporterConfig);
    this.reporterConfig = parseWdioConfig(reporterConfig);
    this.zebrunnerApiClient = new ZebrunnerApiClient(this.reporterConfig);
    this.browserCapabilities;
    this.syncReporting = false;
    this.runOptions = {
      tcmConfig: {},
      labels: [],
      attachments: [],
      references: [],
    };
    this.currentTestOptions = {};
    this.registerServicesListeners();
    this.testStats = [];
    this.testUid;
  }

  registerServicesListeners() {
    process.on(emitterCommands.SET_MAINTAINER, this.setMaintainer.bind(this));
    process.on(emitterCommands.SET_RUN_LABELS, this.setRunLabels.bind(this));
    process.on(emitterCommands.SET_TEST_LABELS, this.setTestLabels.bind(this));
    process.on(emitterCommands.SET_RUN_TCM_OPTIONS, this.setRunTcmOptions.bind(this));
    process.on(emitterCommands.SET_TEST_TCM_OPTIONS, this.setTestTcmOptions.bind(this));
    process.on(emitterCommands.ATTACH_TO_TEST_RUN, this.attachToTestRun.bind(this));
    process.on(emitterCommands.ATTACH_REF_TO_TEST_RUN, this.attachReferenceToTestRun.bind(this));
    process.on(emitterCommands.ATTACH_TO_TEST, this.attachToTest.bind(this));
    process.on(emitterCommands.ATTACH_REF_TO_TEST, this.attachReferenceToTest.bind(this));
    process.on(emitterCommands.REVERT_TEST_REGISTRATION, this.revertTestRegistration.bind(this));
  }

  get isSynchronised() {
    return this.syncReporting;
  }

  set isSynchronised(val) {
    this.syncReporting = val;
  }

  onRunnerStart(runStats: RunnerStats) {
    console.log('onRunnerStart');
    deleteVideoFolder();
    this.browserCapabilities = getBrowserCapabilities(runStats);
  }

  onTestStart(testStats: TestStats) {
    console.log('onTestStart');
    this.testUid = testStats.uid;
  }

  onTestPass(testStats: TestStats) {
    console.log('onTestPass');
    this.testStats.push(testStats);
  }

  onTestFail(testStats: TestStats) {
    console.log('onTestFail');
    this.testStats.push(testStats);
  }

  async onRunnerEnd(runStats: RunnerStats) {
    console.log('onRunnerEnd');
    try {
      if (!this.reporterConfig.enabled) {
        return;
      }
      const runId = await this.zebrunnerApiClient.registerTestRunStart(runStats);
      const arrayOfPromises = this.testStats.map(async (testStat: TestStats) => {
        const testOptions = this.currentTestOptions[testStat.uid];

        const testId = await this.zebrunnerApiClient.startTest(
          runId,
          testStat,
          testOptions?.maintainer[0]
        );
        const sessionId = await this.zebrunnerApiClient.startTestSession(
          runId,
          testStat,
          this.browserCapabilities,
          testId
        );

        await this.zebrunnerApiClient.sendTestLabels(
          runId,
          testId,
          testOptions?.labels,
          testOptions?.testTcmOptions?.[0]
        );
        await this.zebrunnerApiClient.sendTestArtifacts(
          runId,
          testId,
          testOptions?.attachments?.[0]
        );
        await this.zebrunnerApiClient.sendTestArtifactReferences(
          runId,
          testId,
          testOptions?.references?.[0]
        );

        const arrayOfLogs = this.createLogs(testId, testStat);
        await this.zebrunnerApiClient.sendLogs(runId, arrayOfLogs);

        await this.zebrunnerApiClient.sendScreenshots(runId, testStat, testId);
        await this.zebrunnerApiClient.sendTestVideo(runId, testStat, sessionId);

        await this.zebrunnerApiClient.finishTest(runId, testStat, testId);
        await this.zebrunnerApiClient.finishTestSession(runId, testStat, testId, sessionId);

        if (testOptions?.revertTest[0]) {
          await this.zebrunnerApiClient.revertTestRegistration(runId, testId);
          return;
        }
      });
      Promise.all([arrayOfPromises, this.sendRunAttachments(runId, this.runOptions)]).then(() => {
        this.zebrunnerApiClient.registerTestRunFinish(runId, runStats);
      });
    } catch (e) {
      console.log(e);
    } finally {
      this.isSynchronised = true;
    }
  }

  async sendRunAttachments(runId, options) {
    await Promise.all([
      this.zebrunnerApiClient.sendRunArtifacts(runId, options.attachments),
      this.zebrunnerApiClient.sendRunArtifactReferences(runId, options.references),
      this.zebrunnerApiClient.sendRunLabels(runId, options),
    ]);
  }

  revertTestRegistration() {
    this.parseTestOptions('revertTest', true);
  }

  setMaintainer(maintainer) {
    this.parseTestOptions('maintainer', maintainer);
  }

  setTestTcmOptions(options) {
    const testTcmOptions = parseTcmTestOptions(options, this.runOptions.tcmConfig);
    this.parseTestOptions('testTcmOptions', testTcmOptions);
  }

  setRunTcmOptions(options) {
    this.runOptions.tcmConfig = parseTcmRunOptions(options);
  }

  setRunLabels(labels) {
    this.runOptions.labels.push(parseLabels(labels));
  }

  setTestLabels(labels) {
    this.parseTestOptions('labels', parseLabels(labels));
  }

  attachToTestRun(attachments) {
    this.runOptions.attachments = attachments;
  }

  attachReferenceToTestRun(references) {
    this.runOptions.references = references;
  }

  attachToTest(attachments) {
    this.parseTestOptions('attachments', attachments);
  }

  attachReferenceToTest(references) {
    this.parseTestOptions('references', references);
  }

  parseTestOptions(key, option) {
    if (Object.keys(this.currentTestOptions).length === 0) {
      this.currentTestOptions[this.testUid] = {
        [key]: [option],
      };
      return;
    }

    if (this.currentTestOptions.hasOwnProperty(this.testUid)) {
      if (this.currentTestOptions[this.testUid].hasOwnProperty(key)) {
        this.currentTestOptions[this.testUid] = {
          ...this.currentTestOptions[this.testUid],
          [key]: [...this.currentTestOptions[this.testUid][key], option],
        };
      } else {
        this.currentTestOptions[this.testUid] = {
          ...this.currentTestOptions[this.testUid],
          [key]: [option],
        };
      }
    } else {
      this.currentTestOptions[this.testUid] = {
        ...this.currentTestOptions[this.testUid],
        [key]: [option],
      };
    }
  }

  createLogs(testId, testStat) {
    const logsForTest = [];
    if (testStat.start) {
      logsForTest.push({
        testId: testId,
        level: 'INFO',
        message: `TEST ${testStat.fullTitle} STARTED at ${parseDate(testStat.start)}`,
        timestamp: `${testStat.start.getTime()}`,
      });
    }
    if (testStat.end) {
      logsForTest.push({
        testId: testId,
        level: 'INFO',
        message: `TEST ${testStat.fullTitle} ${testStat.state.toUpperCase()} at ${parseDate(
          testStat.end
        )}`,
        timestamp: `${testStat.end.getTime() + 1}`,
      });
    }

    let number = 1;
    const filterLogs = testStat.output.filter((el) => el.type === 'result');
    filterLogs.forEach((item) => {
      if (item.endpoint === '/session/:sessionId/screenshot') {
        return;
      }
      if (item.result.value === null && Object.keys(item.body).length > 0) {
        if (logsForTest.some((log) => log.message === item.body.url)) {
          return;
        }
        logsForTest.push({
          testId: testId,
          level: 'TRACE',
          message: `${item.body.url || item.body.text || item.body.value}`,
          timestamp: `${testStat.start.getTime() + number}`,
        });
      }
      if (typeof item.result.value === 'string') {
        if (logsForTest.some((log) => log.message === item.result.value)) {
          return;
        }
        logsForTest.push({
          testId: testId,
          level: 'TRACE',
          message: `${item.result.value}`,
          timestamp: `${testStat.start.getTime() + number}`,
        });
      }
      number += 1;
    });

    if (testStat.errors) {
      logsForTest.push({
        testId: testId,
        level: 'ERROR',
        message: `${testStat.errors[0].message}`,
        timestamp: `${testStat.end.getTime() - 1}`,
      });
    }

    return logsForTest;
  }
}
