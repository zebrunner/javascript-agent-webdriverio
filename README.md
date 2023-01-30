# Zebrunner WebdriverIO reporting agent

The official Zebrunner WebdriverIO agent provides reporting and smart reruns functionality.

The Agent supports WebdriverIO v7 and v8 and works with Mocha, Jasmine and Cucumber runners.

## Inclusion into your project

### Adding dependency

First, you need to add the Zebrunner Agent into your `package.json` file.

=== "Yarn"

    ```shell
    yarn add @zebrunner/javascript-agent-webdriverio
    ```

=== "NPM"

    ```shell
    npm install @zebrunner/javascript-agent-webdriverio
    ```

### Reporter setup

The agent does not work automatically after adding it into the project, it requires extra configuration. For this, you need to perform the following steps:

1. Navigate to your WebdriverIO configuration file (by default, it is `wdio.conf.js`)
2. Import the `ZebrunnerReporter` and `ZebrunnerService` classes. Depending on the approach you follow, you need to add either

    ```js
    const {ZebrunnerReporter, ZebrunnerService} = require('@zebrunner/javascript-agent-webdriverio');
    ```
   or
    ```js
    import {ZebrunnerReporter, ZebrunnerService} from '@zebrunner/javascript-agent-webdriverio';
    ```

3. Add ZebrunnerReporter to the list of reporters and provide the reporter configuration (you can find more about the configuration in the next section). The reporter must be specified in a nested array. The first array element is a reference on the reporter class (not a string!), the second element is a reporter configuration object. Here is an example of a configuration snippet:

    ```js
    exports.config = {
        reporters: [
            [
                ZebrunnerReporter,
                {
                    // reporter configuration
                }
            ],
            // other reporters
        ],
        // other configs
    }
    ```

4. Add ZebrunnerService to the list of services. The service does not require additional configuration, but it must be specified as a reference on the class (not as string!) and in a nested array of one element. Here is an example of a configuration snippet:

    ```js
    exports.config = {
        services: [
            [ZebrunnerService],
            // other serivces
        ]
    }
    // other configs
    ```
5. Set the `reporterSyncInterval`. Sometimes, Zebrunner Agent requires extra time to submit all the events to Zebrunner. To avoid lost events, it is recommended to set the value to at least `60 * 1000` (60 seconds).

    ```js
    exports.config = {
        reporterSyncInterval: 60 * 1000,
        // other configs
    }
    ```

## Reporter configuration

Once the agent is added into your project, it is **not** automatically enabled. The valid configuration must be provided first.

It is currently possible to provide the configuration via:

1. Environment variables
2. `wdio.conf.js` file

The configuration lookup will be performed in the order listed above, meaning that environment configuration will always take precedence over `wdio.conf.js` file. As a result, it is possible to override configuration parameters by passing them through a configuration mechanism with higher precedence.

### Configuration options

The following subsections contain tables with configuration options. The first column in these tables contains the name of the option. It is represented as an environment variable (the first value) and as a reporter config property from `wdio.conf.js` file (the second value). The second column contains description of the configuration option.

#### Common configuration

| Env var / Reporter config                                | Description                                                                                                                                                                         |
|----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_ENABLED`<br/>`enabled`                        | Enables or disables reporting. The default value is `false`.                                                                                                                        |
| `REPORTING_PROJECT_KEY`<br/>`projectKey`                 | Optional value. It is the key of Zebrunner project that the launch belongs to. The default value is `DEF`.                                                                          |
| `REPORTING_SERVER_HOSTNAME`<br/>`server.hostname`        | Mandatory if reporting is enabled. It is your Zebrunner hostname, e.g. `https://mycompany.zebrunner.com`.                                                                           |
| `REPORTING_SERVER_ACCESS_TOKEN`<br/>`server.accessToken` | Mandatory if reporting is enabled. The access token is used to perform API calls. It can be obtained in Zebrunner on the 'Account and profile' page under the 'API Tokens' section. |

#### Automation launch configuration

The following configuration options allow you to configure accompanying information that will be displayed in Zebrunner for the automation launch.

| Env var / Reporter config                                                    | Description                                                                                                                                                                                                     |
|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_LAUNCH_DISPLAY_NAME`<br/>`launch.displayName`                     | Display name of the launch in Zebrunner. The default value is the package name taken from `package.json` file.                                                                                                  |
| `REPORTING_LAUNCH_BUILD`<br/>`launch.build`                                  | Build number associated with the launch. It can reflect either the test build number or the build number of the application under test.                                                                         |
| `REPORTING_LAUNCH_ENVIRONMENT`<br/>`launch.environment`                      | Represents the target environment in which the tests were run. For example, `stage` or `prod`.                                                                                                                  |
| `REPORTING_LAUNCH_LOCALE`<br/>`launch.locale`                                | Locale that will be displayed for the automation launch in Zebrunner. For example, `en_US`.                                                                                                                     |
| `REPORTING_LAUNCH_TREAT_SKIPS_AS_FAILURES`<br/>`launch.treatSkipsAsFailures` | If the value is set to `true`, skipped tests will be treated as failures when the result of the entire launch is calculated, otherwise skipped tests will be considered as passed. The default value is `true`. |
| `<N/A>`<br/>`launch.labels`                                                  | Object with labels to be attached to the current launch. Property name is the label key, property value is the label value. Label value must be a string.                                                       |
| `<N/A>`<br/>`launch.artifactReferences`                                      | Object with artifact references to be attached to the current launch. Property name is the artifact reference name, property value is the artifact reference value. Value must be a string.                     |

#### Milestone

Zebrunner Milestone for the automation launch can be configured using the following configuration options (all of them are optional).

| Env var / Reporter config                       | Description                                                                                                                                                                                                                         |
|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_MILESTONE_ID`<br/>`milestone.id`     | Id of the Zebrunner Milestone to link the automation launch to. The id is not displayed on Zebrunner UI, so the field is basically used for internal purposes. If the milestone does not exist, the launch will continue executing. |
| `REPORTING_MILESTONE_NAME`<br/>`milestone.name` | Name of the Zebrunner Milestone to link the automation launch to. If the milestone does not exist, the appropriate warning message will be displayed in logs, but the test suite will continue executing.                           |

#### Notifications

Zebrunner provides notification capabilities for automation launch results. The following options configure notification rules and targets.

| Env var / Reporter config                                                               | Description                                                                                                                                                                                                                                                                                                                                                              |
|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE`<br/>`notifications.notifyOnEachFailure` | Specifies whether Zebrunner should send notifications to Slack/Teams on each test failure. The notifications will be sent even if the launch is still running. The default value is `false`.                                                                                                                                                                             |
| `REPORTING_NOTIFICATION_SLACK_CHANNELS`<br/>`notifications.slackChannels`               | A comma-separated list of Slack channels to send notifications to. Notifications will be sent only if the Slack integration is properly configured in Zebrunner with valid credentials for the project the launch is reported to. Zebrunner can send two types of notifications: on each test failure (if the appropriate property is enabled) and on the launch finish. |
| `REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS`<br/>`notifications.teamsChannels`            | A comma-separated list of Microsoft Teams channels to send notifications to. Notifications will be sent only if the Teams integration is configured in the Zebrunner project with valid webhooks for the channels. Zebrunner can send two types of notifications: on each test failure (if the appropriate property is enabled) and on the launch finish.                |
| `REPORTING_NOTIFICATION_EMAILS`<br/>`notifications.emails`                              | A comma-separated list of emails to send notifications to. This type of notifications does not require further configuration on Zebrunner side. Unlike other notification mechanisms, Zebrunner can send emails only on the launch finish.                                                                                                                               |

#### Logs

Zebrunner Reporter collects all the logs produced using the `logLevel` framework (the framework comes bundled with WebdriverIO). The following configuration options control how logs will be submitted to Zebrunner.

| Env var / Reporter config                                         | Description                                                                                                                                                                                                                                 |
|-------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_LOGS_PUSH_DELAY_MILLIS`<br/>`logs.pushDelayMillis`     | The minimum delay in milliseconds between the end of one logs sending request and the commencement of the next one. The default value is `5000`.                                                                                            |
| `REPORTING_LOGS_INCLUDE_LOGGER_NAME`<br/>`logs.includeLoggerName` | If the value is set to `true`, then the logger name will be added in front of the log message. For example, message `started` from logger `tests.e2e` will be submitted to Zebrunner as `tests.e2e: started`. The default value is `false`. |
| `REPORTING_LOGS_EXCLUDE_LOGGERS`<br/>`logs.excludeLoggers`        | A comma-separated list of loggers that should be ignored by the agent logs collector.                                                                                                                                                       |

#### Screenshots

The Zebrunner Reporter can automatically capture and save screenshots during the test execution.

| Env var / Reporter config                                              | Description                                                                                                                                                                                                                               |
|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_SCREENSHOT_BEFORE_COMMANDS`<br/>`screenshot.beforeCommands` | A comma-separated list of WebdriverIO commands before which the Agent will take a screenshot of the browser or device. By default, the Agent does not take screenshots before any command.                                                |
| `REPORTING_SCREENSHOT_AFTER_COMMANDS`<br/>`screenshot.afterCommands`   | A comma-separated list of WebdriverIO commands after which the Agent will take a screenshot of the browser or device. The default list of commands is `'click', 'doubleClick', 'navigateTo', 'elementClick', 'scroll', 'scrollIntoView'`. |
| `REPORTING_SCREENSHOT_AFTER_ERROR`<br/>`screenshot.afterError`         | If the value is set to `true`, the Agent will automatically take a screenshot after every failed test. The default value is `true`.                                                                                                       |

#### Integration with Test Case Management systems

Zebrunner integrates with different Test Case Management (TCM) systems and provides the following capabilities:

1. Linking test cases to test executions
2. Previewing linked test cases in Zebrunner
3. Pushing test execution results to the TCM system

This functionality is currently supported only for Zebrunner Test Case Management, TestRail, Xray, Zephyr Squad and Zephyr Scale.

The link between execution of a test method and corresponding test cases can only be set from within the test method code. For more information about this, see the [Linking test cases to test executions](#linking-test-cases-to-test-executions) section.

If you want to push the execution results to the TCM system, you need to provide additional configuration for the Agent. For all the supported TCMs, Zebrunner can push results to a pre-created test suite execution (this term has a different name in different systems). For TestRail, you can also create a new Test Run based on the Agent configuration and push the results into it. If enabled, the push can be performed either at the end of the whole launch, or in real time after each test.

The following subsection covers how to provide configuration for pushing results to each of the TCM systems.

##### Zebrunner Test Case Management (TCM)

| Env var / Reporter config                                                      | Description                                                                                                                                                             |
|--------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_TCM_ZEBRUNNER_PUSH_RESULTS`<br/>`tcm.zebrunner.pushResults`         | Boolean value which specifies if the execution results should be pushed to Zebrunner TCM. The default value is `false`.                                                 |
| `REPORTING_TCM_ZEBRUNNER_PUSH_IN_REAL_TIME`<br/>`tcm.zebrunner.pushInRealTime` | Boolean value. Specifies whether to push execution results immediately after each test is finished (value `true`) or not (value `false`). The default value is `false`. |
| `REPORTING_TCM_ZEBRUNNER_TEST_RUN_ID`<br/>`tcm.zebrunner.testRunId`            | Numeric id of the target Test Run in Zebrunner TCM. If a value is not provided, no new runs will be created.                                                            |

##### TestRail

| Env var / Reporter config                                                                      | Description                                                                                                                                                                                                                                            |
|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_TCM_TESTRAIL_PUSH_RESULTS`<br/>`tcm.testRail.pushResults`                           | Boolean value which specifies if the execution results should be pushed to TestRail. The default value is `false`.                                                                                                                                     |
| `REPORTING_TCM_TESTRAIL_PUSH_IN_REAL_TIME`<br/>`tcm.testRail.pushInRealTime`                   | Boolean value. Specifies whether to push execution results immediately after each test is finished (value `true`) or not (value `false`). The default value is `false`. Enabling of this option forces the `includeAllTestCasesInNewRun` to be `true`. |
| `REPORTING_TCM_TESTRAIL_SUITE_ID`<br/>`tcm.testRail.suiteId`                                   | Specifies the numeric id of the TestRail Suite in which the tests reside. TestRail displays the ids prefixed with 'S' letter. You need to provide the id without this letter.                                                                          |
| `REPORTING_TCM_TESTRAIL_RUN_ID`<br/>`tcm.testRail.runId`                                       | The id of the TestRail Test Run in which the results should be pushed. TestRail displays the ids prefixed with 'R' letter. You need to provide the id without this letter.                                                                             |
| `REPORTING_TCM_TESTRAIL_RUN_NAME`<br/>`tcm.testRail.runName`                                   | Specifies the name of a new Test Run in TestRail. If push is enabled and run id is not provided, Zebrunner will create a new run in TestRail. If the value is not provided, Zebrunner will use the launch display name.                                |
| `REPORTING_TCM_TESTRAIL_INCLUDE_ALL_IN_NEW_RUN`<br/>`tcm.testRail.includeAllTestCasesInNewRun` | If the value is set to `true`, all cases from the Suite will be added to the newly created Test Run. The value is forced to be `true` if real-time push is enabled. Default value is `false`.                                                          |
| `REPORTING_TCM_TESTRAIL_MILESTONE_NAME`<br/>`tcm.testRail.milestoneName`                       | The newly created Test Run will be associated with the milestone specified using this property.                                                                                                                                                        |
| `REPORTING_TCM_TESTRAIL_ASSIGNEE`<br/>`tcm.testRail.assignee`                                  | Assignee of the newly created Test Run. The value should be the email of an existing TestRail user.                                                                                                                                                    |

##### Xray

| Env var / Reporter config                                            | Description                                                                                                                                                             |
|----------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_TCM_XRAY_PUSH_RESULTS`<br/>`tcm.xray.pushResults`         | Boolean value which specifies if the execution results should be pushed to Xray. The default value is `false`.                                                          |
| `REPORTING_TCM_XRAY_PUSH_IN_REAL_TIME`<br/>`tcm.xray.pushInRealTime` | Boolean value. Specifies whether to push execution results immediately after each test is finished (value `true`) or not (value `false`). The default value is `false`. |
| `REPORTING_TCM_XRAY_EXECUTION_KEY`<br/>`tcm.xray.executionKey`       | The key of the Xray Execution where the results should be pushed.                                                                                                       |

##### Zephyr

| Env var / Reporter config                                                | Description                                                                                                                                                             |
|--------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `REPORTING_TCM_ZEPHYR_PUSH_RESULTS`<br/>`tcm.zephyr.pushResults`         | Boolean value which specifies if the execution results should be pushed to Zephyr. The default value is `false`.                                                        |
| `REPORTING_TCM_ZEPHYR_PUSH_IN_REAL_TIME`<br/>`tcm.zephyr.pushInRealTime` | Boolean value. Specifies whether to push execution results immediately after each test is finished (value `true`) or not (value `false`). The default value is `false`. |
| `REPORTING_TCM_ZEPHYR_JIRA_PROJECT_KEY`<br/>`tcm.zephyr.jiraProjectKey`  | Specifies the key of the Jira project where the tests reside.                                                                                                           |
| `REPORTING_TCM_ZEPHYR_TEST_CYCLE_KEY`<br/>`tcm.zephyr.testCycleKey`      | The key of the Zephyr Test Cycle where the results should be pushed.                                                                                                    |

##### Custom Result Statuses

By default, when the execution results are being pushed to a TCM system, Zebrunner maps each test execution result to an appropriate result status in the target TCM system. Most of the time this work perfectly, but in some cases Zebrunner is not able to derive the appropriate target result status. 

One of the examples of such cases is when a test case result status does not correlate with the test execution status, or when you have conditional logic determining the actual result status for the test case. For such cases the Agent comes with a special method which sets a specific Result Status to the test case. For more information about this, see the [Linking test cases to test executions](#linking-test-cases-to-test-executions) section.

Another example is custom Result Statuses in target TCM system. In this case we cannot anticipate the correct status and simply skip the test execution. In order to tackle this, Zebrunner allows you to configure default status for passed and failed test executions (for skipped tests this is not technically possible, because the tests are not executed by Webdriver.io).

| Env var / Reporter config                                                | Description                                                                                              |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `REPORTING_TCM_TEST_CASE_STATUS_ON_PASS`<br/>`tcm.testCaseStatus.onPass` | The default status that will be assigned to passed test executions when they are pushed to a TCM system. |
| `REPORTING_TCM_TEST_CASE_STATUS_ON_FAIL`<br/>`tcm.testCaseStatus.onFail` | The default status that will be assigned to failed test executions when they are pushed to a TCM system. |

When pushing results to a TCM system, Zebrunner derives the Result Status in the following order:

1. Checks the explicitly assigned value (which was assigned using the `#testCaseStatus()` method).
2. Takes the default status provided via configuration for passed and/or failed tests.
3. Uses internal mapping of Zebrunner statuses to the Result Statuses of the target TCM system. 

### Examples

=== "Environment Variables"

    The following code snippet is a list of all configuration environment variables from .env file:
    ```text
    REPORTING_ENABLED=true
    REPORTING_PROJECT_KEY=DEF
    REPORTING_SERVER_HOSTNAME=https://mycompany.zebrunner.com
    REPORTING_SERVER_ACCESS_TOKEN=somesecretaccesstoken
    
    REPORTING_LAUNCH_DISPLAY_NAME=Nightly Regression
    REPORTING_LAUNCH_BUILD=2.41.2.2431-SNAPSHOT
    REPORTING_LAUNCH_ENVIRONMENT=QA
    REPORTING_LAUNCH_LOCALE=en_US
    REPORTING_LAUNCH_TREAT_SKIPS_AS_FAILURES=true
    
    REPORTING_MILESTONE_ID=57
    REPORTING_MILESTONE_NAME=Release 2.41.2
    
    REPORTING_NOTIFICATION_NOTIFY_ON_EACH_FAILURE=false
    REPORTING_NOTIFICATION_SLACK_CHANNELS=dev, qa
    REPORTING_NOTIFICATION_MS_TEAMS_CHANNELS=dev-channel, management
    REPORTING_NOTIFICATION_EMAILS=manager@mycompany.com
    
    REPORTING_LOGS_PUSH_DELAY_MILLIS=10000
    REPORTING_LOGS_INCLUDE_LOGGER_NAME=true
    REPORTING_LOGS_EXCLUDE_LOGGERS=webdriver
    
    REPORTING_SCREENSHOT_BEFORE_COMMANDS=scroll
    REPORTING_SCREENSHOT_AFTER_COMMANDS=""
    REPORTING_SCREENSHOT_AFTER_ERROR=true

    REPORTING_TCM_TEST_CASE_STATUS_ON_PASS=PASS
    REPORTING_TCM_TEST_CASE_STATUS_ON_FAIL=FAIL

    REPORTING_TCM_ZEBRUNNER_PUSH_RESULTS=false
    REPORTING_TCM_ZEBRUNNER_PUSH_IN_REAL_TIME=true
    REPORTING_TCM_ZEBRUNNER_TEST_RUN_ID=42

    REPORTING_TCM_TESTRAIL_PUSH_RESULTS=false
    REPORTING_TCM_TESTRAIL_PUSH_IN_REAL_TIME=true
    REPORTING_TCM_TESTRAIL_SUITE_ID=100
    REPORTING_TCM_TESTRAIL_RUN_ID=500
    REPORTING_TCM_TESTRAIL_INCLUDE_ALL_IN_NEW_RUN=true
    REPORTING_TCM_TESTRAIL_RUN_NAME=New Demo Run
    REPORTING_TCM_TESTRAIL_MILESTONE_NAME=Demo Milestone
    REPORTING_TCM_TESTRAIL_ASSIGNEE=tester@mycompany.com

    REPORTING_TCM_XRAY_PUSH_RESULTS=false
    REPORTING_TCM_XRAY_PUSH_IN_REAL_TIME=true
    REPORTING_TCM_XRAY_EXECUTION_KEY=QT-100

    REPORTING_TCM_ZEPHYR_PUSH_RESULTS=false
    REPORTING_TCM_ZEPHYR_PUSH_IN_REAL_TIME=true
    REPORTING_TCM_ZEPHYR_JIRA_PROJECT_KEY=ZEB
    REPORTING_TCM_ZEPHYR_TEST_CYCLE_KEY=ZEB-T1
    ```

=== "`wdio.conf.js` file"

    Here you can see an example of the full configuration provided via `wdio.conf.js` file:
    
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
                },
                tcm: {
                    testCaseStatus: {
                        onPass: 'PASS',
                        onFail: 'FAIL',
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
    ]
    // ...
    ```

### Configuration for Zebrunner Launcher

The WebdriverIO Agent is fully integrated with the Zebrunner Launcher and requires even less configuration when used with it. The Zebrunner Launcher automatically provides `REPORTING_ENABLED`, `REPORTING_PROJECT_KEY`, `REPORTING_SERVER_HOSTNAME`, `REPORTING_SERVER_ACCESS_TOKEN` and some other environment variables, so there is no need to explicitly specify them or the corresponding `wdio.conf.js` file properties.

#### Testing Platform and capabilities

Moreover, the Zebrunner Agent will automatically substitute the Selenium server and capabilities configurations with the values selected in **Testing Platform** section in Zebrunner Launcher. For example, if you select **Zebrunner Selenium Grid** as a testing platform and select the `Linux` platform and the `Chrome 105.0` browser, the Zebrunner Agent will apply the following configuration on your `wdio.conf.js` file

```js
// ...
const {ZebrunnerReporter, ZebrunnerService} = require("@zebrunner/javascript-agent-webdriverio")

exports.config = {
    // these values are taken from Zebrunner Selenium Grid integration and replace the original ones.
    // if you use another Selenium provider and it is configured in Zebrunner, its properties will also be applied automatically 
    protocol: 'https',
    hostname: 'engine.zebrunner.com',
    port: 443,
    path: '/wd/hub',
    user: 'user',
    key: 'pass',

    capabilities: [
        {
            // these capabilities are propagated from Zebrunner Launcher and replace the original ones
            platformName: 'Linux',
            browserName: 'chrome',
            browserVersion: '105.0',
            // other original capabilities from the `wdio.conf.js` file...
        },
    ],
    // the service and reporter have to be configured before a launch from Zebrunner Launcher
    services: [
        // ... other services
        [ZebrunnerService]
    ],
    reporters: [
        // ... other reporters
        [
            ZebrunnerReporter,
            {
                // tests will be executed and reported even without any configuration here
                // because Zebrunner Launcher provides all the mandatory environment variables
            }
        ]
    ]
    // other configurations
}
```

If the automatic substitution of properties and capabilities is not the desired behaviour, you can disable it by providing a special environment variable in Zebrunner Launcher - `REPORTING_RUN_SUBSTITUTE_REMOTE_WEB_DRIVERS`. When the value of the env var is `false`, the Zebrunner Agent will **not** substitute capabilities and Selenium server configurations.

#### Custom capabilities

If the automatic substitution of capabilities and Selenium server properties is enabled, you can specify custom capabilities for the launch directly from the Zebrunner Launcher. These capabilities will be applied to the project configuration before a driver session is created.

If it is necessary to set a nested capability, you should append its name separated by a dot. For example, if you want the `enableVideo` capability to be nested within the `zebrunner:options` capability, you would specify the capability name as `zebrunner:options.enableVideo`.

## Collecting test logs

The Zebrunner Reporter collects all the logs produced using the `logLevel` framework within a running test. If a message was logged within the `#before()` or `#after()` section of a test suite, it will not be picked up by the logs collector because these methods are invoked outside the scope of a test. If, according to the `logLevel` settings or the Zebrunner Agent configuration, a message should not be logged, it will be ignored by the log collector.

Here is an example of using the `logLevel` framework:

```js
const log = require("loglevel")

describe('Test Suite', () => {

    const logger = log.getLogger('tests.e2e')

    before(function () {
        logger.warn('this log message will not be submitted into Zebrunner')
    });

    beforeEach(function () {
        logger.info('test started')
    });

    it('empty test', () => {
        logger.debug('executing empty test...')
    });

    afterEach(function () {
        logger.info('test finished')
    });

})
```

To learn more about logs collection configuration, refer to the [Logs configuration section](#Logs).

## Collecting captured screenshots

The Zebrunner Agent allows you to automatically and manually take screenshots and send them into Zebrunner Reporting.

Automatic screenshot capturing is possible after test failures and before or after a WebdriverIO command. To learn more about how to configure automatic screenshot capturing, refer to [Screenshots configuration section](#Screenshots).

Manually taken screenshots can be sent to Zebrunner using the `#saveScreenshot()` method of the `currentTest` object. This method accepts any of the following arguments:
1. A `browser` instance.
2. A `Promise` returned by `#takeScreenshot()` method of a `browser` instance.
3. A base64-encoded `string` resolved from the `Promise` from  the previous option.
4. A `Buffer` instance.

If the `#saveScreenshot()` method is invoked outside a test scope (e.g. in `#before()` or `#after()` sections), it will be ignored.

Here are examples of using the method:

```js
const {currentTest} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('important test', async () => {
        // do something
        currentTest.saveScreenshot(browser)
        currentTest.saveScreenshot(browser.takeScreenshot())
        currentTest.saveScreenshot(await browser.takeScreenshot())
        currentTest.saveScreenshot(Buffer.from(await browser.takeScreenshot(), 'base64'))
        // do something
    });

})
```

## Tracking test maintainer

You may want to add transparency to the process of automation maintenance by having an engineer responsible for evolution of specific tests or test suites. To serve that purpose, Zebrunner comes with a concept of a maintainer.

In order to keep track of those, the Agent comes with the `#setMaintainer()` method of the `currentTest` object. This method accepts the username of an existing Zebrunner user. If there is no user with the given username, `anonymous` will be assigned.

Take a look at the following example.

```js
const {currentTest} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    beforeEach(function () {
        currentTest.setMaintainer('Deve Loper')
    });

    it('first important test', () => {
        currentTest.setMaintainer('Joel Miller')
        // test method code
    });

    it('second important test', () => {
        // test method code
    });

})
```

In this example, `Deve Loper` will be reported as a maintainer of `second important test` (because the value is set in `beforeEach()`), while `Joel Miller` will be reported as a maintainer of the `first important test` (overrides value set in `beforeEach()`).

## Attaching labels to test and launch

In some cases, it may be useful to attach meta information related to a test or the entire launch.

The agent comes with a concept of labels. Label is a simple key-value pair. The label key is represented by a string, the label value accepts a vararg of strings.

To attach a label to a test, you need to invoke the `attachLabel` method of the `currentTest` object in scope of the test method. To attach label to the entire launch, you can either invoke the `attachLabel` method of the `currentLaunch` object or provide the labels in [`wdio.conf.js` file](#Automation-launch-configuration).

Here is an example of attaching labels in code:

```js
const {currentTest, currentLaunch} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    before(function () {
        // will be attached to the entire run
        currentLaunch.attachLabel('label', 'value')
    });

    it('first test', () => {
        // will be attached to this test only
        currentTest.attachLabel('order', '1')
    });

    it('second test', () => {
        // will be attached to this test only
        currentTest.attachLabel('order', '2')
        // will be attached to the entire run
        currentLaunch.attachLabel('second-test-executed', 'true')
    });

    afterEach(function () {
        // will be attached to each test
        currentTest.attachLabel('after-each-executed', 'true')
    });

})
```

## Attaching artifact references to test and launch

Labels are not the only option for attaching meta information to test and launch. If the information you want to attach is a link (to a file or webpage), it is more useful to attach it as an artifact reference (or to put it simply as a link).

The `attachArtifactReference` methods of the `currentTest` and `currentLaunch` objects serve exactly this purpose. These methods accept two arguments. The first one is the artifact reference name which will be shown in Zebrunner. The second one is the artifact reference value.

Also, you can attach artifact references to the entire launch by specifying them in [`wdio.conf.js` file](#Automation-launch-configuration).

```js
const {currentTest, currentLaunch} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    before(function () {
        // will be attached to the entire run
        currentLaunch.attachArtifactReference('Zebrunner', 'https://zebrunner.com')
    });

    it('important test', () => {
        // will be attached to this test only
        currentTest.attachArtifactReference('SUT', 'https://myapp.com/app')
    });

})
```

## Reverting test registration

In some cases, it might be handy not to register test executions in Zebrunner. This may be caused by very special circumstances of a test environment or execution conditions.

Zebrunner Agent comes with a convenient method `#revertRegistration()` of the `currentTest` object for reverting test registration at runtime. The following code snippet shows a case where test is not reported on Monday.

```js
const {currentTest} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('not important test', () => {
        if (new Date().getDay() === 1) {
            currentTest.revertRegistration()
        }
        // test code
    });

})
```

It is worth mentioning that the method invocation does not affect the test execution, but simply unregisters the test in Zebrunner. To interrupt the test execution, you need to do additional actions, for example, throw an Error.

## Linking test cases to test executions

Note: to learn more about pushing results to a TCM system, see the [Integration with Test Case Management systems](#integration-with-test-case-management-systems) section.

### Zebrunner TCM

The Agent comes with the `zebrunner` object which contains methods to link test cases to a currently executing test: 

- `#testCaseKey(...testCaseKeys)` - accepts a list of test cases which should be linked to the current test;
- `#testCaseStatus(testCaseKey, resultStatus)` - links one test case and provides\overrides its result status. This may be useful if the test case result status does not correlate with the test execution status, or if you have conditional logic determining the actual result status for the test case.

If these methods are invoked for the same test case id many times within a test method, the last invocation will take precedence. For example, if you invoke the `#testCaseStatus('KEY-1', 'SKIPPED')` first, and then invoke the `#testCaseKey('KEY-1')`, then the result status you provided in the first invocation will be ignored.

Here is an example:

```js
const {zebrunner} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('first test', () => {
        // links single test case 'KEY-1000' to the test
        zebrunner.testCaseKey("KEY-1000");
        // test code
    });

    it('second test', () => {
        // links test cases 'KEY-2000' and 'KEY-2001' to the current test
        zebrunner.testCaseKey("KEY-2000", "KEY-2001");
        // test code
    });

    it('third test', () => {
        // links test case 'KEY-3000' to the current test
        zebrunner.testCaseKey("KEY-3000");
        // test code
        if (someCondition) {
            // overriddes the status of the test case when results are pushed to the Zebrunner TCM.
            // using this method, you can manually specify the desired result status. 
            zebrunner.testCaseStatus("KEY-3000", "SKIPPED");
        }
    });

})
```

### Testrail

The Agent comes with the `testRail` object which contains methods to link test cases to a currently executing test: 

- `#testCaseId(...testCaseIds)` - accepts a list of test cases which should be linked to current test;
- `#testCaseStatus(testCaseId, resultStatus)` - links one test case and provides\overrides its result status. This may be useful if the test case result status does not correlate with the test execution status, or if you have conditional logic determining the actual result status for the test case.

If these methods are invoked for the same test case id many times within a test method, the last invocation will take precedence. For example, if you invoke the `#testCaseStatus('C1', 'SKIPPED')` first and then invoke the `#testCaseId('C1')`, then the result status you provided in first invocation will be ignored.

Here is an example:

```js
const {testRail} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('first test', () => {
        // links single test case 'C1002' to the test
        testRail.testCaseId("C1000");
        // test code
    });

    it('second test', () => {
        // links test cases 'C2000' and 'C2001' to the current test
        testRail.testCaseId("C2000", "C2001");
        // test code
    });

    it('third test', () => {
        // links test case 'C3000' to the current test
        testRail.testCaseId("C3000");
        // test code
        if (someCondition) {
            // overriddes the status of the test case when results are pushed to the TestRail.
            // by default Zebrunner maps the test execution result to a result status from TestRail.
            // using this method, you can manually specify the desired result status. 
            testRail.testCaseStatus("C3000", "SKIPPED");
        }
    });

})
```

### Xray

The Agent comes with the `xray` object which contains methods to link test cases to a currently executing test:

- `#testCaseKey(...testCaseKeys)` - accepts a list of test cases which should be linked to current test;
- `#testCaseStatus(testCaseKey, resultStatus)` - links one test case and provides\overrides its result status. This may be useful if the test case result status does not correlate with the test execution status, or if you have conditional logic determining the actual result status for the test case.

If these methods are invoked for the same test case id many times within a test method, the last invocation will take precedence. For example, if you invoke the `#testCaseStatus('KEY-1', 'SKIP')` first, and then invoke the `#testCaseKey('KEY-1')`, then the result status you provided in first invocation will be ignored.

Here is an example:

```js
const {xray} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('first test', () => {
        // links single test case 'KEY-1000' to the test
        xray.testCaseKey("KEY-1000");
        // test code
    });

    it('second test', () => {
        // links test cases 'KEY-2000' and 'KEY-2001' to the current test
        xray.testCaseKey("KEY-2000", "KEY-2001");
        // test code
    });

    it('third test', () => {
        // links test case 'KEY-3000' to the current test
        xray.testCaseKey("KEY-3000");
        // test code
        if (someCondition) {
            // overriddes the status of the test case when results are pushed to the Xray.
            // by default Zebrunner maps the test execution result to a result status from Xray.
            // using this method, you can manually specify the desired result status. 
            xray.testCaseStatus("KEY-3000", "SKIP");
        }
    });

})
```

### Zephyr

The Agent comes with the `zephyr` object which contains methods to link test cases to currently executing test:

- `#testCaseKey(...testCaseKeys)` - accepts a list of test cases which should be linked to current test;
- `#testCaseStatus(testCaseKey, resultStatus)` - links one test case and provides\overrides its result status. This may be useful if the test case result status does not correlate with the test execution status, or if you have conditional logic determining the actual result status for the test case.

If these methods are invoked for the same test case id many times within a test method, the last invocation will take precedence. For example, if you invoke the `#testCaseStatus('KEY-1', 'SKIP')` first, and then invoke the `#testCaseKey('KEY-1')`, then the result status you provided in first invocation will be ignored.

Here is an example:

```js
const {zephyr} = require("@zebrunner/javascript-agent-webdriverio")

describe('Test Suite', () => {

    it('first test', () => {
        // links single test case 'KEY-1000' to the test
        zephyr.testCaseKey("KEY-1000");
        // test code
    });

    it('second test', () => {
        // links test cases 'KEY-2000' and 'KEY-2001' to the current test
        zephyr.testCaseKey("KEY-2000", "KEY-2001");
        // test code
    });

    it('third test', () => {
        // links test case 'KEY-3000' to the current test
        zephyr.testCaseKey("KEY-3000");
        // test code
        if (someCondition) {
            // overriddes the status of the test case when results are pushed to the Zephyr.
            // by default Zebrunner maps the test execution result to a result status from Zephyr.
            // using this method, you can manually specify the desired result status. 
            zephyr.testCaseStatus("KEY-3000", "SKIP");
        }
    });

})
```
