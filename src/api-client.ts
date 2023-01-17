import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import log from 'loglevel';
import { ZebrunnerPaths } from './constant';
import { ReportingConfig } from './reporting-config';
import {
    AttachArtifactReferencesRequest,
    AttachLabelsRequest,
    ExchangedRunContext,
    FinishTestRequest,
    FinishTestRunRequest,
    FinishTestSessionRequest,
    LinkTestsAndTestSessionRequest,
    LogEntry,
    RefreshTokenRequest,
    StartTestRequest,
    StartTestRunRequest,
    StartTestSessionRequest,
    UpdateTestRequest,
} from './types';

export class ApiClient {
    private readonly logger = log.getLogger('zebrunner.api-client');

    private readonly accessToken: string;

    private readonly axiosInstance: AxiosInstance;

    constructor(reportingConfig: ReportingConfig) {
        this.accessToken = reportingConfig.server.accessToken;
        this.axiosInstance = axios.create({
            baseURL: reportingConfig.server.hostname,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        this.axiosInstance.interceptors.request.use((config) => {
            // don't log the logs sending because it can produce infinite stream of logs
            if (config.url.indexOf('logs') === -1) {
                let message = `Sending Request\n${config.method.toUpperCase()} ${config.baseURL}${config.url}\n\n`;
                if (!Buffer.isBuffer(config.data)) {
                    message += `Body\n${JSON.stringify(config.data)}`;
                }

                this.logger.debug(message);
            }
            return config;
        }, (error) => error);
        this.axiosInstance.interceptors.response.use((response) => response, (error) => {
            const { request, response } = error;

            let errorMessage = '';
            if (request) {
                errorMessage += `Could not sent request ${request.method} ${request.protocol}//${request.host}${request.path}\n\n`;
            }
            if (response) {
                errorMessage += `Raw response\n${JSON.stringify(response?.data)}\n\n`;
            }
            errorMessage += error.stack;

            this.logger.warn(errorMessage);
            throw error;
        });
    }

    private async authenticateIfRequired() {
        if (!this.axiosInstance.defaults.headers.common.Authorization) {
            const request = new RefreshTokenRequest(this.accessToken);
            const response = await this.axiosInstance.post(ZebrunnerPaths.REFRESH_TOKEN(), request);

            this.axiosInstance.defaults.headers.common.Authorization = `${response.data.authTokenType} ${response.data.authToken}`;
        }
    }

    async exchangeRunContext(runContext: string): Promise<ExchangedRunContext> {
        await this.authenticateIfRequired();

        const response = await this.axiosInstance.post(ZebrunnerPaths.EXCHANGE_RUN_CONTEXT(), runContext);
        return new ExchangedRunContext(response.data);
    }

    async startTestRun(projectKey: string, request: StartTestRunRequest): Promise<number> {
        await this.authenticateIfRequired();

        const response = await this.axiosInstance.post(ZebrunnerPaths.START_TEST_RUN(), request, { params: { projectKey } });
        return response.data.id as number;
    }

    async finishTestRun(id: number, request: FinishTestRunRequest): Promise<void> {
        return this.axiosInstance.put(ZebrunnerPaths.FINISH_TEST_RUN(id), request);
    }

    async startTestSession(testRunId: number, request: StartTestSessionRequest): Promise<number> {
        await this.authenticateIfRequired();

        const response = await this.axiosInstance.post(ZebrunnerPaths.START_TEST_SESSION(testRunId), request);
        return response.data.id as number;
    }

    async finishTestSession(testRunId: number, testSessionId: number, request: FinishTestSessionRequest): Promise<void> {
        return this.axiosInstance.put(ZebrunnerPaths.FINISH_TEST_SESSION(testRunId, testSessionId), request);
    }

    async startTest(testRunId: number, request: StartTestRequest): Promise<number> {
        await this.authenticateIfRequired();

        const response = await this.axiosInstance.post(ZebrunnerPaths.START_TEST(testRunId), request);
        return response.data.id as number;
    }

    async restartTest(testRunId: number, testId: number, request: StartTestRequest): Promise<number> {
        await this.authenticateIfRequired();

        const response = await this.axiosInstance.post(ZebrunnerPaths.RESTART_TEST(testRunId, testId), request);
        return response.data.id as number;
    }

    async linkTestsAndTestSession(testRunId: number, testSessionId: number, request: LinkTestsAndTestSessionRequest): Promise<void> {
        return this.axiosInstance.put(ZebrunnerPaths.UPDATE_TEST_SESSION(testRunId, testSessionId), request);
    }

    async finishTest(testRunId: number, testId: number, request: FinishTestRequest): Promise<void> {
        return this.axiosInstance.put(ZebrunnerPaths.FINISH_TEST(testRunId, testId), request);
    }

    async uploadTestScreenshot(testRunId: number, testId: number, screenshot: any): Promise<void> {
        const config: AxiosRequestConfig = {
            headers: {
                'x-zbr-screenshot-captured-at': new Date().getTime(),
            },
        };
        return this.axiosInstance.post(ZebrunnerPaths.UPLOAD_SCREENSHOT(testRunId, testId), screenshot, config);
    }

    async sendLogs(testRunId: number, logs: LogEntry[]): Promise<void> {
        if (logs?.length) {
            return this.axiosInstance.post(ZebrunnerPaths.SEND_LOGS(testRunId), logs);
        }
    }

    async revertTestRegistration(testRunId: number, testId: number): Promise<void> {
        return this.axiosInstance.delete(ZebrunnerPaths.REVERT_TEST_REGISTRATION(testRunId, testId));
    }

    async updateTest(testRunId: number, testId: number, request: UpdateTestRequest): Promise<void> {
        return this.axiosInstance.patch(ZebrunnerPaths.UPDATE_TEST(testRunId, testId), request);
    }

    async attachTestRunLabels(testRunId: number, request: AttachLabelsRequest): Promise<void> {
        if (request?.items?.length) {
            return this.axiosInstance.put(ZebrunnerPaths.ATTACH_TEST_RUN_LABELS(testRunId), request);
        }
    }

    async attachTestLabels(testRunId: number, testId: number, request: AttachLabelsRequest): Promise<void> {
        if (request?.items?.length) {
            return this.axiosInstance.put(ZebrunnerPaths.ATTACH_TEST_LABELS(testRunId, testId), request);
        }
    }

    async attachTestRunArtifactReferences(testRunId: number, request: AttachArtifactReferencesRequest): Promise<void> {
        if (request?.items?.length) {
            return this.axiosInstance.put(ZebrunnerPaths.ATTACH_TEST_RUN_ARTIFACT_REFERENCES(testRunId), request);
        }
    }

    async attachTestArtifactReferences(testRunId: number, testId: number, request: AttachArtifactReferencesRequest): Promise<void> {
        if (request?.items?.length) {
            return this.axiosInstance.put(ZebrunnerPaths.ATTACH_TEST_ARTIFACT_REFERENCES(testRunId, testId), request);
        }
    }
}
