# Zebrunner WebdriverIO reporting agent

The official Zebrunner WebdriverIO agent provides reporting and smart reruns functionality.

The Agent support WebdriverIO v7 and v8 and works with Mocha, Jasmine and Cucumber runners.

## Inclusion into your project

### Adding dependency

First, you need to add the Zebrunner Agent into your `package.json` file.

If you use yarn, run

```
yarn add @zebrunner/javascript-agent-webdriverio@1.0.0
```

If you use npm, run

```
npm install @zebrunner/javascript-agent-webdriverio@1.0.0
```

### Reporter setup

The agent is not working automatically after adding to the project, it requires extra configuration. For this, you need to perform the following steps:
1. navigate to your WebdriverIO configuration file (by default, it is `wdio.conf.js`)
2. import the ZebrunnerReporter and ZebrunnerService classes. Depending on the approach you follow, you need to add either

    ```
    const {ZebrunnerReporter, ZebrunnerService} = require('javascript-agent-wdio');
    ```

    or

    ```
    import {ZebrunnerReporter, ZebrunnerService} from 'javascript-agent-wdio';
    ```
3. add ZebrunnerReporter to the list of reporters and provide reporter configuration (more about the configuration you can find in the following sections). The reporter must be specified in a nested array. First array element is a reference on reporter class (not a string!), second element is a reporter configuration object. Here is the example of configuration snippet:

    ```js
    // ...
    reporters: [
        /// ...
        [
            ZebrunnerReporter,
            {
                // reporter configuration
            }
        ],
        // ...
    ]
    // ...
    ```

4. add ZebrunnerService to the list of services. The service does not require additional configuration, but it must be specified as a reference on class (not as string!) and in a nested array of one element. Here is the example of configuration snippet:

    ```js
    // ...
    services: [
        [ZebrunnerService]
    ]
    // ...
    ```

## Reporter configuration

Once the agent is configured for your project, it is **not** automatically enabled. The valid configuration must be provided first.

It is currently possible to provide the configuration via:

1. Environment variables
2. `wdio.conf.js` file

The configuration lookup will be performed in the order listed above, meaning that environment configuration will always take precedence over `wdio.conf.js` file. As a result, it is possible to override configuration parameters by passing them through a configuration mechanism with higher precedence.

### via environment variables

The agent provides comprehensive configuration capabilities covering different aspects of tests reporting.

#### Common configuration

| Parameter                       | Description                                                                                                                                                                        |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_ENABLED`             | Enables or disables reporting. The default value is `false`                                                                                                                        |
| `REPORTING_PROJECT_KEY`         | Optional value. It is the key of Zebrunner project that the launch belongs to. The default value is `DEF`.                                                                         |
| `REPORTING_SERVER_HOSTNAME`     | Mandatory if reporting is enabled. It is your Zebrunner hostname, e.g. `https://mycompany.zebrunner.com`                                                                           |
| `REPORTING_SERVER_ACCESS_TOKEN` | Mandatory if reporting is enabled. The access token is used to perform API calls. It can be obtained in Zebrunner on the 'Account and profile' page under the 'API Tokens' section |

#### Automation launch configuration

The following environment variables allow you to configure accompanying information that will be displayed in Zebrunner for the automation launch.

| Parameter                                  | Description                                                                                                                                                                                                    |
|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_LAUNCH_DISPLAY_NAME`            | Display name of the launch in Zebrunner. The default value is the package name taken from `package.json` file                                                                                                  |
| `REPORTING_LAUNCH_BUILD`                   | This is the build number associated with the launch. It can reflect either the test build number or the build number of the application under test                                                             |
| `REPORTING_LAUNCH_ENVIRONMENT`             | Represents the target environment in which the tests were run. For example, `stage` or `prod`                                                                                                                  |
| `REPORTING_LAUNCH_LOCALE`                  | Locale, that will be displayed for the automation launch in Zebrunner. For example, `en_US`                                                                                                                    |
| `REPORTING_LAUNCH_TREAT_SKIPS_AS_FAILURES` | If the value is set to `true`, skipped tests will be treated as failures when the result of the entire launch is calculated, otherwise skipped tests will be considered as passed. The default value is `true` |

#### Milestone

Zebrunner Milestone for the automation launch can be configured using the following environment variables (all the configurations are optional):

| Parameter                  | Description                                                                                                                                                                                                                        |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_MILESTONE_ID`   | Id of the Zebrunner Milestone to link the automation launch to. The id is not displayed on Zebrunner UI, so the field is basically used for internal purposes. If the milestone does not exist, the launch will continue executing |
| `REPORTING_MILESTONE_NAME` | Name of the Zebrunner Milestone to link the automation launch to. If the milestone does not exist, appropriate warning message will be displayed in logs, but the test suite will continue executing                               |

#### Notifications

Zebrunner provides notification capabilities for automation launch results. The following optional environment variables configure notifications rules and targets:

| Parameter                                       | Description                                                                                                                                                                                                                                                                                                                                                     |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE` | Specifies whether Zebrunner should send notification to Slack/Teams on each test failure. The notifications will be sent even if the launch is still running. The default value is `false`                                                                                                                                                                      |
| `REPORTING_NOTIFICATION_SLACK_CHANNELS`         | The comma-separated list of Slack channels to send notifications to. Notification will be sent only if Slack integration is properly configured in Zebrunner with valid credentials for the project the launch is reported to. Zebrunner can send two type of notifications: on each test failure (if appropriate property is enabled) and on the launch finish |
| `REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS`      | The comma-separated list of Microsoft Teams channels to send notifications to. Notification will be sent only if Teams integration is configured in Zebrunner project with valid webhooks for the channels. Zebrunner can send two type of notifications: on each test failure (if appropriate property is enabled) and on the launch finish                    |
| `REPORTING_NOTIFICATION_EMAILS`                 | The comma-separated list of emails to send notifications to. This type of notification does not require further configuration on Zebrunner side. Unlike other notification mechanisms, Zebrunner can send emails only on the launch finish                                                                                                                      |

#### Logs

The Zebrunner Agent collects logs produced using logLevel framework (the framework comes bundled with WebdriverIO). The following environment variables control logs how logs will be submitted to Zebrunner:

| Parameter                            | Description                                                                                                                                                                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_LOGS_PUSH_DELAY_MILLIS`   | The minimum delay in milliseconds between the end of one logs sending request and the commencement of the next one. The default value is `5000`                                                                             |
| `REPORTING_LOGS_INCLUDE_LOGGER_NAME` | If value is set to `true`, then logger name will added in front of log message. For example, message `started` from logger `tests.e2e` will be submitted to Zebrunner as `tests.e2e: started`. The default value is `false` |
| `REPORTING_LOGS_EXCLUDE_LOGGERS`     | The comma-separated list of loggers that should be ignored by the agent logs collector                                                                                                                                      |

#### Screenshots

Zebrunner Reporter collects all logs produced using logLevel framework (the framework comes bundled with WebdriverIO). The following environment variables control logs how logs will be submitted to Zebrunner:

| Parameter                              | Description                                                                                                                                                                                                                               |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_SCREENSHOT_BEFORE_COMMANDS` | The comma-separated list of WebdriverIO command before which the Agent will take a screenshot of the browser or device. By default, the Agent does not take screenshots before commands                                                   |
| `REPORTING_SCREENSHOT_AFTER_COMMANDS`  | The comma-separated list of WebdriverIO command after which the Agent will take a screenshot of the browser or device. The default list of commands is `'click', 'doubleClick', 'navigateTo', 'elementClick', 'scroll', 'scrollIntoView'` |
| `REPORTING_SCREENSHOT_AFTER_ERROR`     | If value is set to `true`, the Agent will automatically take a screenshot after every failed test. The default value is `true`                                                                                                            |

### via `wdio.conf.js` file

Using the `wdio.conf.js` file provides the same configuration capabilities as environment variables, but also adds a few extra options.

You can see the example of full configuration on the following code snippet. The following subsections describe each property in more details.

```js
// ...
reporters: [
    [
        ZebrunnerReporter,
        {
            enabled: true,
            projectKey: 'DEF',
            server: {
                hostname: 'https://mycompany.zebrunner.com',
                accessToken: 'somesecretaccesstoken'
            },
            launch: {
                displayName: 'Nightly Regression',
                build: '2.41.2.2431-SNAPSHOT',
                environment: 'QA',
                locale: 'en_US',
                treatSkipsAsFailures: true,
                labels: {
                    configuredBy: 'Alice',
                    reviewer: 'Bob'
                },
                artifactReferences: {
                    zebrunner: 'https://zebrunner.com'
                }
            },
            milestone: {
                id: 57,
                name: 'Release 2.41.2'
            },
            screenshots: {
                afterError: true,
                beforeCommands: ['scroll'],
                afterCommands: []
            },
            logs: {
                pushDelayMillis: 10000,
                includeLoggerName: true,
                excludeLoggers: 'webdriver'
            },
            notifications: {
                notifyOnEachFailure: false,
                slackChannels: 'dev, qa',
                teamsChannels: 'dev-channel, management',
                emails: 'manager@mycompany.com'
            }
        }
    ]
]
// ...
```

#### Common configuration

| Parameter            | Description                                                                                                                                                                        |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`            | Enables or disables reporting. The default value is `false`                                                                                                                        |
| `projectKey`         | Optional value. It is the key of Zebrunner project that the launch belongs to. The default value is `DEF`.                                                                         |
| `server.hostname`    | Mandatory if reporting is enabled. It is your Zebrunner hostname, e.g. `https://mycompany.zebrunner.com`                                                                           |
| `server.accessToken` | Mandatory if reporting is enabled. The access token is used to perform API calls. It can be obtained in Zebrunner on the 'Account and profile' page under the 'API Tokens' section |

#### Automation launch configuration

The following properties allow you to configure accompanying information that will be displayed in Zebrunner for the automation launch.

| Parameter                     | Description                                                                                                                                                                                                    |
|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `launch.displayName`          | Display name of the launch in Zebrunner. The default value is the package name taken from `package.json` file                                                                                                  |
| `launch.build`                | This is the build number associated with the launch. It can reflect either the test build number or the build number of the application under test                                                             |
| `launch.environment`          | Represents the target environment in which the tests were run. For example, `stage` or `prod`                                                                                                                  |
| `launch.locale`               | Locale, that will be displayed for the automation launch in Zebrunner. For example, `en_US`                                                                                                                    |
| `launch.treatSkipsAsFailures` | If the value is set to `true`, skipped tests will be treated as failures when the result of the entire launch is calculated, otherwise skipped tests will be considered as passed. The default value is `true` |
| `launch.labels`               | If the value is set to `true`, skipped tests will be treated as failures when the result of the entire launch is calculated, otherwise skipped tests will be considered as passed. The default value is `true` |
| `launch.artifactReferences`   | If the value is set to `true`, skipped tests will be treated as failures when the result of the entire launch is calculated, otherwise skipped tests will be considered as passed. The default value is `true` |

#### Milestone

Zebrunner Milestone for the automation launch can be configured using the following environment variables (all the configurations are optional):

| Parameter                  | Description                                                                                                                                                                                                                        |
|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_MILESTONE_ID`   | Id of the Zebrunner Milestone to link the automation launch to. The id is not displayed on Zebrunner UI, so the field is basically used for internal purposes. If the milestone does not exist, the launch will continue executing |
| `REPORTING_MILESTONE_NAME` | Name of the Zebrunner Milestone to link the automation launch to. If the milestone does not exist, appropriate warning message will be displayed in logs, but the test suite will continue executing                               |

#### Notifications

Zebrunner provides notification capabilities for automation launch results. The following optional environment variables configure notifications rules and targets:

| Parameter                                       | Description                                                                                                                                                                                                                                                                                                                                                     |
|-------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE` | Specifies whether Zebrunner should send notification to Slack/Teams on each test failure. The notifications will be sent even if the launch is still running. The default value is `false`                                                                                                                                                                      |
| `REPORTING_NOTIFICATION_SLACK_CHANNELS`         | The comma-separated list of Slack channels to send notifications to. Notification will be sent only if Slack integration is properly configured in Zebrunner with valid credentials for the project the launch is reported to. Zebrunner can send two type of notifications: on each test failure (if appropriate property is enabled) and on the launch finish |
| `REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS`      | The comma-separated list of Microsoft Teams channels to send notifications to. Notification will be sent only if Teams integration is configured in Zebrunner project with valid webhooks for the channels. Zebrunner can send two type of notifications: on each test failure (if appropriate property is enabled) and on the launch finish                    |
| `REPORTING_NOTIFICATION_EMAILS`                 | The comma-separated list of emails to send notifications to. This type of notification does not require further configuration on Zebrunner side. Unlike other notification mechanisms, Zebrunner can send emails only on the launch finish                                                                                                                      |

#### Logs

The Zebrunner Agent collects logs produced using logLevel framework (the framework comes bundled with WebdriverIO). The following environment variables control logs how logs will be submitted to Zebrunner:

| Parameter                            | Description                                                                                                                                                                                                                 |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_LOGS_PUSH_DELAY_MILLIS`   | The minimum delay in milliseconds between the end of one logs sending request and the commencement of the next one. The default value is `5000`                                                                             |
| `REPORTING_LOGS_INCLUDE_LOGGER_NAME` | If value is set to `true`, then logger name will added in front of log message. For example, message `started` from logger `tests.e2e` will be submitted to Zebrunner as `tests.e2e: started`. The default value is `false` |
| `REPORTING_LOGS_EXCLUDE_LOGGERS`     | The comma-separated list of loggers that should be ignored by the agent logs collector                                                                                                                                      |

#### Screenshots

Zebrunner Reporter collects all logs produced using logLevel framework (the framework comes bundled with WebdriverIO). The following environment variables control logs how logs will be submitted to Zebrunner:

| Parameter                              | Description                                                                                                                                                                                                                               |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_SCREENSHOT_BEFORE_COMMANDS` | The comma-separated list of WebdriverIO command before which the Agent will take a screenshot of the browser or device. By default, the Agent does not take screenshots before commands                                                   |
| `REPORTING_SCREENSHOT_AFTER_COMMANDS`  | The comma-separated list of WebdriverIO command after which the Agent will take a screenshot of the browser or device. The default list of commands is `'click', 'doubleClick', 'navigateTo', 'elementClick', 'scroll', 'scrollIntoView'` |
| `REPORTING_SCREENSHOT_AFTER_ERROR`     | If value is set to `true`, the Agent will automatically take a screenshot after every failed test. The default value is `true`                                                                                                            |


## Tracking of test results

It is currently possible to provide the configuration via:

- `Environment variables`
- `Webdriver config`

Environment variables:

- `REPORTING_ENABLED` - `mandatory`, enables or disables reporting. The default value is false. If disabled, the agent
  will use no op component implementations that will simply log output for tracing purposes with the trace level;
- `REPORTING_SERVER_HOSTNAME` - `mandatory` if reporting is enabled. It is Zebrunner server hostname. It can be obtained
  in Zebrunner on the 'Account & profile' page under the 'Service URL' section;
- `REPORTING_SERVER_ACCESS_TOKEN` - `mandatory` if reporting is enabled. Access token must be used to perform API calls.
  It can be obtained in Zebrunner on the 'Account & profile' page under the 'Token' section;

- `REPORTING_PROJECT_KEY` - `optional` value. It is the project that the test run belongs to. The default value is `DEF`
  . You can manage projects in Zebrunner in the appropriate section;
- `REPORTING_LAUNCH_DISPLAY_NAME` - `optional` value. It is the display name of the test run. The default value
  is `Default Suite`;
- `REPORTING_LAUNCH_BUILD` - `optional` value. It is the build number that is associated with the test run. It can depict
  either the test build number or the application build number;
- `REPORTING_LAUNCH_ENVIRONMENT` - `optional` value. It is the environment where the tests will run;
  `REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE` - `optional` value. Specifies whether Zebrunner should send
  notification to Slack/Teams on each test failure. The notifications will be sent even if the suite is still running.
  The default value is `false`;
- `REPORTING_NOTIFICATION_SLACK_CHANNELS` - `optional` value. The list of comma-separated Slack channels to send
  notifications to. Notification will be sent only if Slack integration is properly configured in Zebrunner with valid
  credentials for the project the tests are reported to. Zebrunner can send two type of notifications: on each test
  failure (if appropriate property is enabled) and on suite finish;
- `REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS` - `optional` value. The list of comma-separated Microsoft Teams channels to
  send notifications to. Notification will be sent only if Teams integration is configured in Zebrunner project with
  valid webhooks for the channels. Zebrunner can send two type of notifications: on each test failure (if appropriate
  property is enabled) and on suite finish;
- `REPORTING_NOTIFICATION_EMAILS` - `optional` value. The list of comma-separated emails to send notifications to. This
  type of notification does not require further configuration on Zebrunner side. Unlike other notification mechanisms,
  Zebrunner can send emails only on suite finish;
- `REPORTING_MILESTONE_ID` - `optional` value. Id of the Zebrunner milestone to link the suite execution to. The id is
  not displayed on Zebrunner UI, so the field is basically used for internal purposes. If the milestone does not exist,
  appropriate warning message will be displayed in logs, but the test suite will continue executing;
- `REPORTING_MILESTONE_NAME` - `optional` value. Name of the Zebrunner milestone to link the suite execution to. If the
  milestone does not exist, appropriate warning message will be displayed in logs, but the test suite will continue
  executing;
- `REPORTING_LAUNCH_LOCALE` - `optional` - locale, that will be displayed for the run in Zebrunner if specified;

Wdio config example:

```js
const {ZebrunnerReporter} = require('@zebrunner/javascript-agent-webdriver');
require("dotenv").config();

const config = {
    enabled: true,
    reportingServerHostname: "https://webdriver.zebrunner.com",
    reportingProjectKey: "DEF",
    reportingRunDisplayName: "PW-tests",
    reportingRunBuild: "alpha-1",
    reportingRunEnvironment: "STAGE",
    reportingNotificationNotifyOnEachFailure: true,
    reportingNotificationSlackChannels: "channel1,channel2",
    reportingNotificationMsTeamsChannels: "channel1,channel2",
    reportingNotificationEmails: "channel1,channel2",
    reportingMilestoneId: "1",
    reportingMilestoneName: "test",
    reportingRunLocale: "en_US",
};

module.export = {
    reporters: [[ZebrunnerReporter, config]],
};
```

## Attach video and screenshots

First you need additional library `wdio-video-reporter`

`yarn add wdio-video-reporter`

then add video-reporter to `wdio.conf.js`

```js
const {ZebrunnerReporter} = require('@zebrunner/javascript-agent-webdriver');
require('dotenv').config();
const video = require("wdio-video-reporter");

module.exports = {
    reporters: [
        [
            video,
            {
                saveAllVideos: true,
                videoSlowdownMultiplier: 3,
                outputDir: "<output dir>",
            },
        ],
        [ZebrunnerReporter, config],
    ],
};
```

All screenshots and video will attach to the desired test

## Collecting additional artifacts

In case your tests or entire test run produce some artifacts, it may be useful to track them in Zebrunner. The agent
comes with a few convenient methods for uploading artifacts in Zebrunner and linking them to the currently running test
or the test run.

Artifacts methods:

- The `attachToTestRun(name)` and `attachToTest(name)` methods can be used to upload and attach an artifact file to test
  run and test respectively. Also need create folder `artifacts` and put run attachments there.
- The `attachReferenceToTestRun(name, reference)` and `attachReferenceToTest(name, reference)` methods can be used to
  attach an arbitrary artifact reference to test run and test respectively.

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    before(() => {
        reporterEmitter.attachToTestRun(["runEBAY.txt", "runWDIO.txt"]);
        reporterEmitter.attachReferenceToTestRun([
            ["run ref1", "https://www.linkedin.com"],
            ["run ref2", "https://www.stackoverflow.com"],
        ]);
    });

    it("test describe", () => {
        reporterEmitter.attachToTest(["testEBAY1.txt", "testEBAY2.txt"]);
        reporterEmitter.attachReferenceToTest([
            ["test ref", "https://github.com"],
            ["test ref2", "https://youtube.com"],
        ]);
        // ...some test code
    });
});
```

### Tracking test maintainer

You may want to add transparency to the process of automation maintenance by having an engineer responsible for
evolution of specific tests or test classes. Zebrunner comes with a concept of a maintainer - a person that can be
assigned to maintain tests. In order to keep track of those, the agent comes with the `setMaintainer` method.

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    it("test", () => {
        reporterEmitter.setMaintainer("emarf");
        // ...some test code
    });

    it("another test", () => {
        reporterEmitter.setMaintainer("simple");
        // ...some test code
    });
});
```

In the example above, `emarf` will be reported as a maintainer of `test`, while `simple` will be reported as a
maintainer of test `another test`.

The maintainer username should be a valid Zebrunner username, otherwise it will be set to `anonymous`.

## Attaching labels

In some cases, it may be useful to attach some meta information related to a test.

Labels methods:

- `setRunLabel({key: value})` attached labels for run
- `setTestLabel({key: value})` attached labels for test

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    before(() => {
        reporterEmitter.setRunLabels({
            Chrome: "97.0",
            os: "linux",
        });
    });

    it("test describe", () => {
        reporterEmitter.setTestLabels({
            Author: "Deve Loper",
        });
        // ...some test code
    });

    it("another test describe", () => {
        reporterEmitter.setTestLabels({
            Author: "simple",
        });
        // ...some test code
    });
});
```

The values of attached labels will be displayed in Zebrunner under the name of a corresponding test or run.

## Reverting test registration

In some cases it might be handy not to register test execution in Zebrunner. This may be caused by very special
circumstances of test environment or execution conditions.

You can use `revertTestRegistration` method for managing test registration at runtime.

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    it("test describe", () => {
        reporterEmitter.revertTestRegistration();
        // ...some test code
    });
});
```

It is worth mentioning that the method invocation does not affect the test execution, but simply unregisters the test in
Zebrunner.

## Upload test results to external test case management systems

Zebrunner provides an ability to upload test results to external TCMs on test run finish. For some TCMs it is possible
to upload results in real-time during the test run execution.

Currently, Zebrunner supports `TestRail`, `Xray`, `Zephyr Squad` and `Zephyr Scale` test case management systems.

### Testrail

For successful upload of test run results in TestRail, two steps must be performed:

- Integration with TestRail is configured and enabled for Zebrunner project;
- Configuration is performed on the tests side.

### Configuration

Zebrunner agent has a special TestRail class with a bunch of methods to control results upload:

- `setSuiteId`(string) - `mandatory`. The method sets TestRail suite id for current test run. This method must be
  invoked before all tests;
- `setCaseId`(array of strings) - `mandatory`. Using these mechanisms you can set TestRail's case associated with
  specific automated test;
- `disableSync`(boolean) - `optional`. Disables result upload. Same as `setSuiteId`(string), this method must be invoked
  before all tests;
- `includeAllTestCasesInNewRun`(boolean) - `optional`. Includes all cases from suite into newly created run in TestRail.
  Same as `setSuiteId`(string), this method must be invoked before all tests;
- `enableRealTimeSync`(boolean) - `optional`. Enables real-time results upload. In this mode, result of test execution
  will be uploaded immediately after test finish. This method also automatically invokes `includeAllTestCasesInNewRun`.
  Same as `setSuiteId`(string), this method must be invoked before all tests;
- `setRunId`(string) - `optional`. Adds result into existing TestRail run. If not provided, test run is treated as new.
  Same as `setSuiteId`(string), this method must be invoked before all tests;
- `setRunName`(string) - `optional`. Sets custom name for new TestRail run. By default, Zebrunner test run name is used.
  Same as `setSuiteId`(string), this method must be invoked before all tests;
- `setMilestone`(string) - `optional`. Adds result in TestRail milestone with the given name. Same as `setSuiteId`(
  string), this method must be invoked before all tests;
- `setAssignee`(string) - optional. Sets TestRail run assignee. Same as `setSuiteId`(string), this method must be
  invoked before all tests. By default, a new run containing only cases assigned to the tests will be created in
  TestRail on test run finish;

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    before(() => {
        const tcmRunOptions = [
            {
                testRailSuiteId: "testRailSuite",
                testRailRunId: "322",
                testRailRunName: "testRailName",
                testRailMilestone: "milestone",
                testRailAssignee: "emarf",
                testRailDisableSync: true,
                testRailIncludeAll: true,
                testRailEnableRealTimeSync: true,
            },
        ];
        reporterEmitter.setRunTcmOptions(tcmRunOptions);
    });

    it("should verify title search laptop and verify title", async () => {
        const tcmTestOptions = [
            {
                xrayTestKey: ["testKey", "testKey1"],
            },
            {
                testRailCaseId: ["caseId", "caseId1"],
            },
            {
                zephyrTestCaseKey: ["zephyr", "zephyr1"],
            },
        ];

        reporterEmitter.setTestTcmOptions(tcmTestOptions);
        // some test code...
    });
});
```

### Xray

For successful upload of test run results in Xray two steps must be performed:

- Xray integration is configured and enabled in Zebrunner project
- Xray configuration is performed on the tests side

### Configuration

Zebrunner agent has a special Xray class with a bunch of methods to control results upload:

- `setExecutionKey`(string) - `mandatory`. The method sets Xray execution key. This method must be invoked before all
  tests.
- `setTestKey`(array of string) - `mandatory`. Using these mechanisms you can set test keys associated with specific
  automated test.
- `disableSync`(boolean) - `optional`. Disables result upload. Same as `setExecutionKey`(string), this method must be
  invoked before all tests;
- `enableRealTimeSync`(boolean) - `optional`. Enables real-time results upload. In this mode, result of test execution
  will be uploaded immediately after test finish. Same as `setExecutionKey`(string), this method must be invoked before
  all tests.

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    before(() => {
        const tcmRunOptions = [
            {
                xrayExecutionKey: 'execKey',
                xrayDisableSync: true,
                xrayEnableRealTimeSync: true,
            },
        ];
        reporterEmitter.setRunTcmOptions(tcmRunOptions);
    });

    it("should verify title search laptop and verify title", async () => {
        const tcmTestOptions = [
            {
                xrayTestKey: ["testKey", "testKey1"],
            },
        ];
        reporterEmitter.setTestTcmOptions(tcmTestOptions);
        // some test code...
    });
});
```

### Zephyr Squad & Zephyr Scale

For successful upload of test run results in Zephyr two steps must be performed:

- Zephyr integration is configured and enabled in Zebrunner project
- Zephyr configuration is performed on the tests side

### Configuration

- `setTestCycleKey`(string) - `mandatory`. The method sets Zephyr test cycle key. This method must be invoked before all
  tests;
- `setJiraProjectKey`(string) - `mandatory`. Sets Zephyr Jira project key. Same as `setTestCycleKey`(string), this
  method must be invoked before all tests;
- `setTestCaseKey`(array of string) - `mandatory`. Using these mechanisms you can set test case keys associated with
  specific automated test;
- `disableSync`() - `optional`. Disables result upload. Same as `setTestCycleKey`(string), this method must be invoked
  before all tests;
- `enableRealTimeSync`() - `optional`. Enables real-time results upload. In this mode, result of test execution will be
  uploaded immediately after test finish. Same as `setTestCycleKey`(string), this method must be invoked before all
  tests;

```js
const {reporterEmitter} = require('@zebrunner/javascript-agent-webdriver');


describe("run describe", () => {
    before(() => {
        const tcmRunOptions = [
            {
                zephyrTestCycleKey: 'zephyr123',
                zephyrJiraProjectKey: 'zephyr321',
                zephyrDisableSync: true,
                zephyrEnableRealTimeSync: true,
            }
        ];
        reporterEmitter.setRunTcmOptions(tcmRunOptions);
    });

    it("should verify title search laptop and verify title", async () => {
        const tcmTestOptions = [
            {
                zephyrTestCaseKey: ['zephyr', 'zephyr1'],
            },
        ];
        reporterEmitter.setTestTcmOptions(tcmTestOptions);
        // some test code...
    });
});
```

Sometimes reporter doesn't have enough time to complete run and you need to add to `wdio.conf.js` next:

```js
exports.config = {
    reporterSyncInterval: 10 * 1000,
    // ...another config options
};
```
