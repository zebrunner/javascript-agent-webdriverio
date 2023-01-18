import { LogEntry } from './types';
import { ApiClient } from './api-client';
import { Storage } from './storage';
import { LogLevelLogsCollector } from './log-level-logs-collector';
import { LogsConfig } from './reporting-config';

export class LogsManager {
    private readonly storage: Storage;

    private readonly apiClient: ApiClient;

    private readonly logsConfig: LogsConfig;

    private readonly logs: LogEntry[] = [];

    private timerId: any;

    private stopped = false;

    private currentLogsSending: Promise<any>;

    constructor(storage: Storage) {
        this.storage = storage;
        this.apiClient = storage.apiClient;
        this.logsConfig = storage.reportingConfig.logs;

        new LogLevelLogsCollector(this.store.bind(this));

        this.scheduleLogsSending();
    }

    private async store(loggerName: string, logLevel: string, message: string) {
        if (!this.logsConfig.excludeLoggers.has(loggerName) && this.storage.testId) {
            // time must be set before potentially asynchronous operation completes
            const now = Date.now();
            const testId = await this.storage.testId;

            if (this.logsConfig.includeLoggerName) {
                message = `${loggerName.toString()}: ${message}`;
            }
            this.logs.push(new LogEntry(testId, logLevel, now, message));
        }
    }

    private scheduleLogsSending() {
        this.timerId = setTimeout(async () => {
            this.timerId = null;
            this.currentLogsSending = this.sendLogs();

            await this.currentLogsSending;

            if (!this.stopped) {
                this.scheduleLogsSending();
            }
        }, this.logsConfig.pushDelayMillis);
    }

    private async sendLogs() {
        const logs: LogEntry[] = this.logs.splice(0);
        return this.apiClient.sendLogs(this.storage.testRunId, logs);
    }

    async close() {
        this.stopped = true;
        clearTimeout(this.timerId);

        await this.currentLogsSending;
        return this.sendLogs();
    }
}
