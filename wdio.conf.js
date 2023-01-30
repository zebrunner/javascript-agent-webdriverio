const {
    ZebrunnerReporter,
    ZebrunnerService
} = require('./build/index');

exports.config = {
    reporterSyncInterval: 10 * 1000,

    runner: 'local',

    protocol: 'https',
    hostname: 'engine.zebrunner.com',
    port: 443,
    path: '/wd/hub',
    user: 'brenkotest1',
    key: '62hrjCf34APzD2CE',

    specs: [
        './test/specs/**/*.js'
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],

    maxInstances: 1,
    capabilities: [
        {
            maxInstances: 1,
            browserName: 'chrome',
        },
    ],

    logLevel: 'debug',

    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 0,

    services: [
        [
            ZebrunnerService
        ]
    ],

    reporters: [
        [
            ZebrunnerReporter,
            {
                enabled: true,
                projectKey: 'DEF',
                server: {
                    hostname: 'https://brenkotest1.zebrunner.com',
                    accessToken: 'VhL7PPdX2FOZN0voaz1z67TDIi6f1XwWhlhVSLym4C6rCN2wZn'
                },
                launch: {
                    displayName: null,
                    build: 'alpha-1',
                    environment: 'Local',
                    locale: 'en_US',
                    treatSkipsAsFailures: false,
                    labels: {
                        runner: 'Alice',
                        reviewer: 'Bob'
                    },
                    artifactReferences: {
                        landing: 'https://zebrunner.com'
                    }
                },
                milestone: {
                    id: 5,
                    name: 'Release 1.5.0'
                },
                screenshots: {
                    beforeCommands: [],
                    afterCommands: [],
                    afterError: true
                },
                logs: {
                    pushDelayMillis: 5000,
                    includeLoggerName: true,
                    excludeLoggers: ['webdriver']
                },
                notifications: {
                    notifyOnEachFailure: false,
                    slackChannels: 'dev, qa',
                    teamsChannels: 'dev-channel, management',
                    emails: 'sbrenko@zebrunner.com'
                },
                tcm: {
                    testCaseStatus: {
                        onPass: 'SUCCESS',
                        onFail: '',
                    },
                    zebrunner: {
                        pushResults: false,
                        pushInRealTime: true,
                        testRunId: 42
                    },
                    testRail: {
                        pushResults: false,
                        pushInRealTime: true,
                        suiteId: 100,
                        runId: 500,
                        includeAllTestCasesInNewRun: true,
                        runName: 'New Demo Run',
                        milestoneName: 'Demo Milestone',
                        assignee: 'tester@mycompany.com'
                    },
                    xray: {
                        pushResults: false,
                        pushInRealTime: true,
                        executionKey: 'QT-100'
                    },
                    zephyr: {
                        pushResults: false,
                        pushInRealTime: true,
                        jiraProjectKey: 'ZEB',
                        testCycleKey: 'ZEB-T1'
                    }
                }
            }
        ]
    ],

    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000,
    }
};
