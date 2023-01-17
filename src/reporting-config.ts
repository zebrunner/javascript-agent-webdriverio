import log from 'loglevel';
import { ArtifactReference, Label } from './types';
import { isArray, isNotBlankString , isString} from './type-utils';

const logger = log.getLogger('zebrunner');

const logsPushDelay = 5000;
const screenshotBeforeCommands: string[] = [];
const screenshotAfterCommands: string[] = ['click', 'doubleClick', 'navigateTo', 'elementClick', 'scroll', 'scrollIntoView'];

interface ServerConfig {

    readonly hostname: string
    readonly accessToken: string

}

interface LaunchConfig {

    readonly context: string
    readonly displayName: string
    readonly build: string
    readonly environment: string
    readonly locale: string
    readonly treatSkipsAsFailures: boolean
    readonly labels: Label[]
    readonly artifactReferences: ArtifactReference[]

}

interface MilestoneConfig {

    readonly id: number
    readonly name: string

}

export interface LogsConfig {

    readonly pushDelayMillis: number
    readonly includeLoggerName: boolean
    readonly excludeLoggers: Set<string>

}

export interface ScreenshotConfig {

    readonly afterError: boolean
    readonly beforeCommands: Set<string>
    readonly afterCommands: Set<string>

}

interface NotificationsConfig {

    readonly notifyOnEachFailure: boolean
    readonly slackChannels: string
    readonly teamsChannels: string
    readonly emails: string

}

function getString(envVar: string, configValue: any, defaultValue: string = null): string {
    const value = process.env[envVar] as string;

    return isNotBlankString(value)
        ? value
        : isNotBlankString(configValue)
            ? configValue
            : defaultValue;
}

function getBoolean(envVar: string, configValue: any, defaultValue = false): boolean {
    return process.env[envVar]?.toLowerCase?.() === 'true'
        || configValue === true
        || configValue?.toLowerCase?.() === 'true'
        || defaultValue;
}

function getNumber(envVar: string, configValue: any, defaultValue: number = null): number {
    return parseInt(process.env[envVar], 10)
        || parseInt(configValue, 10)
        || defaultValue;
}

function tokenizeString(value: string, defaultTokens: string[] = []): string[] {
    return isNotBlankString(value)
        ? value.split(',').map((val) => val.trim())
        : defaultTokens;
}

function getSetOfStrings(envVar: string, configValue: any, defaultValue: string[] = []): Set<string> {
    const envVarValue = process.env[envVar];

    const values: string[] = isNotBlankString(envVarValue)
        ? tokenizeString(envVarValue)
        : isArray(configValue)
            ? configValue.flatMap((value) => tokenizeString(value))
            : isString(configValue)
                ? tokenizeString(configValue)
                : defaultValue;

    return new Set<string>(values);
}

function parseLabels(config: any): Label[] {
    const labels = config?.launch?.labels || {};

    return Object.keys(labels)
        .filter((key) => {
            const isNotBlank = isNotBlankString(labels[key]);
            if (!isNotBlank) {
                logger.warn(`Label value must be a not blank string. Configuration contains label with key '${key}' which violates this`);
            }
            return isNotBlank;
        })
        .map((key) => ({ key, value: labels[key] }));
}

function parseArtifactReferences(config: any): ArtifactReference[] {
    const artifactReferences = config?.launch?.artifactReferences || {};

    return Object.keys(artifactReferences)
        .filter((name) => {
            const isNotBlank = isNotBlankString(artifactReferences[name]);
            if (!isNotBlank) {
                logger.warn(`Artifact reference value must be a not blank string. Configuration contains artifact reference with name '${name}' which violates this`);
            }
            return isNotBlank;
        })
        .map((name) => ({ name, value: artifactReferences[name] }));
}

export class ReportingConfig {
    readonly enabled: boolean;

    readonly projectKey: string;

    readonly server: ServerConfig;

    readonly launch: LaunchConfig;

    readonly milestone: MilestoneConfig;

    readonly logs: LogsConfig;

    readonly screenshot: ScreenshotConfig;

    readonly notifications: NotificationsConfig;

    constructor(config: any) {
        this.enabled = getBoolean('REPORTING_ENABLED', config?.enabled);
        this.projectKey = getString('REPORTING_PROJECT_KEY', config?.projectKey, 'DEF');
        this.server = {
            hostname: getString('REPORTING_SERVER_HOSTNAME', config?.server?.hostname),
            accessToken: getString('REPORTING_SERVER_ACCESS_TOKEN', config?.server?.accessToken),
        };

        if (this.enabled === true && !this.server.hostname && !this.server.accessToken) {
            throw new Error('When reporting is enabled, you must provide Zebrunner hostname and accessToken');
        }

        this.launch = {
            context: getString('REPORTING_RUN_CONTEXT', null),
            displayName: getString('REPORTING_LAUNCH_DISPLAY_NAME', config?.launch?.displayName, process.env.npm_package_name),
            build: getString('REPORTING_LAUNCH_BUILD', config?.launch?.build),
            environment: getString('REPORTING_LAUNCH_ENVIRONMENT', config?.launch?.environment),
            locale: getString('REPORTING_LAUNCH_LOCALE', config?.launch?.locale),
            treatSkipsAsFailures: getBoolean('REPORTING_LAUNCH_TREAT_SKIPS_AS_FAILURES', config?.launch?.treatSkipsAsFailures, true),
            labels: parseLabels(config),
            artifactReferences: parseArtifactReferences(config),
        };

        this.milestone = {
            id: getNumber('REPORTING_MILESTONE_ID', config?.milestone?.id),
            name: getString('REPORTING_MILESTONE_NAME', config?.milestone?.name),
        };

        this.logs = {
            pushDelayMillis: getNumber('REPORTING_LOGS_PUSH_DELAY_MILLIS', config?.logs?.pushDelayMillis, logsPushDelay),
            includeLoggerName: getBoolean('REPORTING_LOGS_INCLUDE_LOGGER_NAME', config?.logs?.includeLoggerName),
            excludeLoggers: getSetOfStrings('REPORTING_LOGS_EXCLUDE_LOGGERS', config?.logs?.excludeLoggers),
        };

        this.screenshot = {
            afterError: getBoolean('REPORTING_SCREENSHOT_AFTER_ERROR', config?.screenshots?.afterError, true),
            beforeCommands: getSetOfStrings('REPORTING_SCREENSHOT_BEFORE_COMMANDS', config?.screenshots?.beforeCommands, screenshotBeforeCommands),
            afterCommands: getSetOfStrings('REPORTING_SCREENSHOT_AFTER_COMMANDS', config?.screenshots?.afterCommands, screenshotAfterCommands),
        };

        this.notifications = {
            notifyOnEachFailure: getBoolean('REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE', config?.notifications?.notifyOnEachFailure),
            slackChannels: getString('REPORTING_NOTIFICATION_SLACK_CHANNELS', config?.notifications?.slackChannels),
            teamsChannels: getString('REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS', config?.notifications?.teamsChannels),
            emails: getString('REPORTING_NOTIFICATION_EMAILS', config?.notifications?.emails),
        };
    }
}
