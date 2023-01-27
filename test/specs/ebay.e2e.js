const log = require('loglevel');
const {
    currentTest,
    currentLaunch,
    zebrunner,
    testRail,
    zephyr,
    xray
} = require('../../src');

describe('Ebay Product Search', () => {

    const logger = log.getLogger('ebay.e2e');

    beforeEach(function () {
        logger.info('test started');
        currentTest.attachLabel('feature', 'ebay');
    });

    it('empty test', async () => {
        currentTest.attachLabel('empty', 'true');
        testRail.testCases('1', '2', '3');
    });

    it('empty test with browser.reloadSession()', async () => {
        currentTest.setMaintainer('vasya');
        zebrunner.testCase('DEF-1');
        await browser.reloadSession();
        zebrunner.testCaseStatus('DEF-2', 'PASSED');
        currentTest.attachLabel('reloaded', 'true');
    });

    it('should verify title search laptop and verify title', async () => {
        currentTest.setMaintainer('vasya');
        zephyr.testCases('QT-1', 'QT-2')
        currentTest.attachArtifactReference('Zebrunner', 'https://zebrunner.com');

        await browser.url(`https://www.ebay.com`);
        zephyr.testCaseStatus('QT-2', 'FAIL');

        await expect(browser)
            .toHaveTitle('Electronics, Cars, Fashion, Collectibles & More | eBay');

        const searchInput = $('#gh-ac');
        const searchBtn = $('#gh-btn');

        await searchInput.addValue('laptop');
        await searchBtn.click();

        await expect(searchInput)
            .toHaveValue('laptop');
        await expect(browser)
            .toHaveTitle('laptop for sale | eBay');
    });

    it('should search telephones and verify title', async () => {
        const searchInput = $('#gh-ac');
        const searchBtn = $('#gh-btn');
        xray.testCase('CASE-22');

        await searchInput.clearValue();
        xray.testCaseStatus('CASE-22', 'STATUS');
        await searchInput.addValue('telephones');
        xray.testCaseStatus('CASE-22', 'PASSED');
        xray.testCaseStatus('CASE-23', 'PASSED');
        await searchBtn.click();

        currentLaunch.attachArtifactReference('ebay', 'https://ebay.com');
        xray.testCases('CASE-2', 'CASE-22', 'CASE-222');

        await expect(searchInput)
            .toHaveValue('telephones');
        await expect(browser)
            .toHaveTitle('telephones: Search Result | eBay');
    });

    it.skip('skipped', () => {
    });

    it('empty', () => {
    });

    afterEach(function () {
        logger.info('test finished');
        currentTest.attachLabel('in-after-each', 'true');
    });

    after(function () {
        currentLaunch.attachLabel('ebay-tests-finished', 'true');
    });

});

