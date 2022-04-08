const { reporterEmitter } = require('../../build/index');

describe('Webdriverio main page', () => {

  before(() => {
    // const tcmRunOptions = [
    //   {
    //     xrayExecutionKey: 'execKey',
    //     // xrayDisableSync: true,
    //     // xrayEnableRealTimeSync: true
    //   },
    //   {
    //     testRailSuiteId: 'testRailSuite',
    //     // testRailRunId: '322',
    //     // testRailRunName: 'testRailName',
    //     // testRailMilestone: 'milestone',
    //     // testRailAssignee: 'emarf',
    //     // testRailDisableSync: true,
    //     // testRailIncludeAll: true,
    //     // testRailEnableRealTimeSync: true,
    //   },
    //   {
    //     zephyrTestCycleKey: 'zephyr123',
    //     zephyrJiraProjectKey: 'zephyr321',
    //     // zephyrDisableSync: true,
    //     // zephyrEnableRealTimeSync: true,
    //   }
    // ]

    // reporterEmitter.setRunTcmOptions(tcmRunOptions);
    reporterEmitter.setRunLabels({
      Chrome: "87.0",
      version: 'test1',
    })
    reporterEmitter.attachToTestRun(['runEBAY.txt', 'runWDIO.txt'])
    reporterEmitter.attachReferenceToTestRun([
      ['run ref1', 'https://www.linkedin.com'],
      ['run ref2', 'https://www.stackoverflow.com'],
    ])
  })

  it('should be right title', async () => {
    const tcmTestOptions = [
      {
        xrayTestKey: ['testKey', 'testKey1'],
      },
      {
        testRailCaseId: ['caseId', 'caseId1'],
      },
      {
        zephyrTestCaseKey: ['zephyr', 'zephyr1'],
      },
    ];
    reporterEmitter.setMaintainer('emarf');
    reporterEmitter.setTestTcmOptions(tcmTestOptions);
    reporterEmitter.setTestLabels({
      Author: 'dimple',
    });
    reporterEmitter.attachToTest(['testEBAY1.txt', 'testEBAY2.txt'])
    reporterEmitter.attachReferenceToTest([
      ['test ref', 'https://github.com'],
      ['test ref2', 'https://youtube.com']
    ])

    await browser.url(`https://webdriver.io`);
    await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO');
  });
});
