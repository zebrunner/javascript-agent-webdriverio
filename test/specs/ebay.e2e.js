// import { reporterEmitter } from '../../build/index';
const { reporterEmitter } = require('../../build/index');

describe('Ebay Product Search', () => {
  before(() => {
    const tcmRunOptions = [
      {
        xrayExecutionKey: 'execKey',
        // xrayDisableSync: true,
        // xrayEnableRealTimeSync: true
      },
      {
        testRailSuiteId: 'testRailSuite',
        // testRailRunId: '322',
        // testRailRunName: 'testRailName',
        // testRailMilestone: 'milestone',
        // testRailAssignee: 'emarf',
        // testRailDisableSync: true,
        // testRailIncludeAll: true,
        // testRailEnableRealTimeSync: true,
      },
      {
        // zephyrTestCycleKey: 'zephyr123',
        zephyrJiraProjectKey: 'zephyr321',
        // zephyrDisableSync: true,
        // zephyrEnableRealTimeSync: true,
      }
    ]

    reporterEmitter.setRunTcmOptions(tcmRunOptions);
    reporterEmitter.setRunLabels({
      Chrome: "85.0",
      os: 'linux',
    })
    reporterEmitter.setRunLabels({
      Chrome: "87.0",
      os: 'macos',
    })

    reporterEmitter.attachToTestRun(['runEBAY.txt', 'runWDIO.txt'])
    reporterEmitter.attachReferenceToTestRun([
      ['run ref1', 'https://www.linkedin.com'],
      ['run ref2', 'https://www.stackoverflow.com'],
    ])
  })

  it('should verify title search laptop and verify title', async () => {
    // reporterEmitter.revertTestRegistration();

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
      Author: 'Deve Loper',
    });
    reporterEmitter.setTestLabels({
      test: 'best',
    });

    reporterEmitter.attachToTest(['testEBAY1.txt', 'testEBAY2.txt'])
    reporterEmitter.attachReferenceToTest([
      ['test ref', 'https://github.com'],
      ['test ref2', 'https://youtube.com']
    ])

    await browser.url(`https://www.ebay.com`);

    await expect(browser).toHaveTitle('Электроника, автомобили, мода, коллекционирование, купоны и другие товары | eBay');

    const searchInput = $('#gh-ac');
    const searchBtn = $('#gh-btn');

    await searchInput.addValue('laptop');
    await searchBtn.click();

    await expect(searchInput).toHaveValue('laptop');

    await expect(browser).toHaveTitle('laptop: Search Result | eBay');
  });

  it('should search telephones and verify title', async () => {

    reporterEmitter.setMaintainer('emarf');
    reporterEmitter.setTestLabels({
      Author: 'simple',
    });
    reporterEmitter.setTestLabels({
      foo: 'bar',
    });

    const searchInput = $('#gh-ac');
    const searchBtn = $('#gh-btn');

    await searchInput.clearValue();
    await searchInput.addValue('telephones');
    await searchBtn.click();

    await expect(searchInput).toHaveValue('telephones');

    await expect(browser).toHaveTitle('telephones: Search Result | eBay');

  });
})

