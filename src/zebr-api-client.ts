import {BrowserCapabilities, ReporterConfig, RunOptions, TestOptions} from './types/index';
import HttpClient from './apiConstructor';
import {
  getTestRunStart,
  getTestRunEnd,
  getTestStart,
  getTestEnd,
  getTestSessionStart,
  getTestSessionEnd,
  getTestRunLabels,
  getTestLabels,
} from './request-builder';
import {
  getTestArtifacts,
  getArtifactReferences,
  getVideoAttachments,
  getFileSizeInBytes,
  getScreenshotAttachments,
} from './utils';
import {commonHeaders, urls} from './constants';
import {RunnerStats, TestStats} from '@wdio/reporter';
export default class ZebrunnerApiClient {
  private reporterConfig: ReporterConfig;
  private httpClient;
  private accessToken;
  constructor(reporterConfig) {
    this.reporterConfig = reporterConfig;
    this.httpClient = new HttpClient(this.reporterConfig);
    this.accessToken;
  }

  async refreshToken() {
    if (!this.accessToken) {
      const res = await this.httpClient.fetchRequest(
        'POST',
        urls.URL_REFRESH,
        process.env.REPORTING_SERVER_ACCESS_TOKEN,
        commonHeaders.jsonHeaders.headers
      );
      const token = res.data.authTokenType + ' ' + res.data.authToken;
      this.accessToken = token;
    }
    return this.accessToken;
  }

  async getHeadersWithAuth(basicHeaders) {
    const authToken = await this.refreshToken();
    if (authToken) {
      let authHeaders = basicHeaders.headers;
      authHeaders['Authorization'] = authToken;
      return authHeaders;
    }
  }

  async registerTestRunStart(runStats: RunnerStats) {
    const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
    const project = this.reporterConfig.reportingProjectKey
      ? this.reporterConfig.reportingProjectKey
      : 'DEF';
    const testRunStartBody = getTestRunStart(runStats, this.reporterConfig);
    try {
      const response = await this.httpClient.fetchRequest(
        'POST',
        urls.URL_REGISTER_RUN.replace('${project}', project),
        testRunStartBody,
        headers
      );
      console.log('Run id was registered: ' + response.data.id);
      return response.data.id;
    } catch (e) {
      console.log(e);
    }
  }

  async registerTestRunFinish(runId: string, testStat: TestStats) {
    try {
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      await this.httpClient.fetchRequest(
        'PUT',
        urls.URL_FINISH_RUN.concat(runId),
        getTestRunEnd(testStat),
        headers
      );
      console.log(`Run with id ${runId} was finished`);
    } catch (e) {
      console.log(e);
    }
  }

  async startTest(runId: string, testStat: TestStats, maintainer: string) {
    try {
      const url = urls.URL_START_TEST.replace('${testRunId}', runId);
      const testStartBody = getTestStart(testStat, maintainer);
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const response = await this.httpClient.fetchRequest('POST', url, testStartBody, headers);

      console.log(`Test '${testStat.fullTitle}' was registered by id ${response.data.id}`);
      return response.data.id;
    } catch (e) {
      console.log(e);
    }
  }

  async finishTest(runId: string, testStat: TestStats, testId: string) {
    try {
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const testEnd = getTestEnd(testStat);
      const url = urls.URL_FINISH_TEST.replace('${testRunId}', runId).replace('${testId}', testId);
      const response = await this.httpClient.fetchRequest('PUT', url, testEnd, headers);
      console.log(
        `Test with ID ${testId} was finished with status ${testStat.state.toUpperCase()}`
      );
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async startTestSession(
    runId: string,
    testStat: TestStats,
    capabilities: BrowserCapabilities,
    testId: string
  ) {
    try {
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const testSession = getTestSessionStart(testStat, testId, capabilities);
      const url = urls.URL_START_SESSION.replace('${testRunId}', runId);
      const response = await this.httpClient.fetchRequest('POST', url, testSession, headers);

      console.log(
        `Session with id ${response.data.id} was registered for test '${testStat.fullTitle}'`
      );
      return response.data.id;
    } catch (e) {
      console.log(e);
    }
  }

  async finishTestSession(runId: string, test: TestStats, testId: string, sessionId: string) {
    try {
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const testSession = getTestSessionEnd(test, testId);
      const url = urls.URL_UPDATE_SESSION.replace('${testRunId}', runId).replace(
        '${testSessionId}',
        sessionId
      );
      const response = await this.httpClient.fetchRequest('PUT', url, testSession, headers);
      console.log(`Session with id ${sessionId} was finish`);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async sendLogs(runId: string, logs: any[]) {
    try {
      const url = urls.URL_SEND_LOGS.replace('${testRunId}', runId);
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const response = await this.httpClient.fetchRequest('POST', url, logs, headers);

      if (response.data.id) {
        console.log(`send logs for all test run`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendRunLabels(runId: string, options: RunOptions) {
    try {
      const url = urls.URL_SET_RUN_LABELS.replace('${testRunId}', runId);
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const runLabels = getTestRunLabels(this.reporterConfig, options);

      if (runLabels.items.length > 0) {
        await this.httpClient.fetchRequest('PUT', url, runLabels, headers);
        console.log(`Labels were send for run id ${runId}`);
      } else {
        console.log(`No labels for run id ${runId}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendTestLabels(runId: string, testId: string, labels, tcmOptions) {
    try {
      const url = urls.URL_SET_TEST_LABELS.replace('${testRunId}', runId).replace(
        '${testId}',
        testId
      );
      const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
      const payload = getTestLabels(labels, tcmOptions);
      if (payload.items.length > 0) {
        const response = await this.httpClient.fetchRequest('PUT', url, payload, headers);
        return response;
      } else {
        console.log(`No labels for test ${testId}`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async sendScreenshots(runId: string, testStat: TestStats, testId: string) {
    try {
      const url = urls.URL_SEND_SCREENSHOT.replace('${testRunId}', runId).replace(
        '${testId}',
        testId
      );
      let headers = await this.getHeadersWithAuth(commonHeaders.imageHeaders);
      const arrOfScreenshots = getScreenshotAttachments(testStat.title, testStat.parent);
      if (!testId || !arrOfScreenshots) {
        return;
      }

      Promise.all(
        arrOfScreenshots.map(async (screen, index) => {
          headers['x-zbr-screenshot-captured-at'] = testStat.start.getTime() + index + 1;
          return await this.httpClient.fetchRequest('POST', url, screen, headers);
        })
      )
        .then((res) => {
          if (res) {
            console.log(`Screenshots were attached to the test id ${testId}`);
          }
        })
        .catch((e) => console.log(e));
    } catch (e) {
      console.log(e);
    }
  }

  async sendTestVideo(runId: string, testStat: TestStats, sessionId: string) {
    const {formData, videoPath} = await getVideoAttachments(testStat.title, testStat.parent);
    if (!formData) {
      return;
    }
    const url = urls.URL_SEND_SESSION_ARTIFACTS.replace('${testRunId}', runId).replace(
      '${testSessionId}',
      sessionId
    );
    let headers = await this.getHeadersWithAuth(commonHeaders.multipartDataHeaders);
    headers['Content-Type'] = formData.getHeaders()['content-type'];
    // headers['x-zbr-video-content-length'] = getFileSizeInBytes(videoPath);
    const response = await this.httpClient.fetchRequest('POST', url, formData, headers);
    if (response.status === 200) {
      console.log(`Video send`);
    }
    return response;
  }

  async sendTestArtifacts(runId: string, testId: string, attachments: TestOptions) {
    const url = urls.URL_SEND_TEST_ARTIFACTS.replace('${testRunId}', runId).replace(
      '${testId}',
      testId
    );
    if (attachments && attachments.length > 0) {
      await this._attachmentBody(runId, url, attachments, testId);
    } else {
      console.log(`No files for test ${testId}`);
    }
  }

  async sendRunArtifacts(runId: string, attachments: TestOptions) {
    const url = urls.URL_SEND_RUN_ARTIFACTS.replace('${testRunId}', runId);
    if (attachments.length > 0) {
      await this._attachmentBody(runId, url, attachments);
    } else {
      console.log(`No files for run ${runId}`);
    }
  }

  async _attachmentBody(runId: string, url: string, attachments, testId = '') {
    let headers = await this.getHeadersWithAuth(commonHeaders.multipartDataHeaders);
    const attachFiles = getTestArtifacts(attachments);
    attachFiles.forEach(async (el) => {
      headers['Content-Type'] = el.getHeaders()['content-type'];
      await this.httpClient.fetchRequest('POST', url, el, headers);
      console.log(`File attach to ${testId ? `test ${testId}` : `run ${runId}`}`);
    });
  }

  async sendTestArtifactReferences(runId: string, testId: string, references) {
    const url = urls.URL_SEND_TEST_ARTIFACT_REFERENCES.replace('${testRunId}', runId).replace(
      '${testId}',
      testId
    );
    if (references && references.length > 0) {
      await this._referenceBody(runId, url, references, testId);
    } else {
      console.log(`No ref for test ${testId}`);
    }
  }

  async sendRunArtifactReferences(runId: string, references) {
    const url = urls.URL_SEND_RUN_ARTIFACT_REFERENCES.replace('${testRunId}', runId);
    if (references.length > 0) {
      await this._referenceBody(runId, url, references);
    } else {
      console.log(`No ref to run ${runId}`);
    }
  }

  async _referenceBody(runId: string, url: string, options, testId = '') {
    const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
    const attachLinks = getArtifactReferences(options);
    await this.httpClient.fetchRequest('PUT', url, attachLinks, headers);
    console.log(`References attach to ${testId ? `test ${testId}` : `run ${runId}`}`);
  }

  async revertTestRegistration(runId: string, testId: string) {
    const headers = await this.getHeadersWithAuth(commonHeaders.jsonHeaders);
    const url = urls.URL_REVERT_TEST_REGISTRATION.replace('${testRunId}', runId).replace(
      '${testId}',
      testId
    );
    const response = await this.httpClient.fetchRequest('DELETE', url, null, headers);
    if (response) {
      console.log(`Test with id ${testId} revert`);
    }
  }
}
