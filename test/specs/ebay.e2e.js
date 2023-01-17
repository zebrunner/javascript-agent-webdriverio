import log from "loglevel"
const {currentTest, currentLaunch} = require("../../src")

describe('Ebay Product Search', () => {

    const logger = log.getLogger('ebay.e2e')

    beforeEach(function () {
        logger.info('test started')
        currentTest.attachLabel('feature', 'ebay')
    })

    it('empty test', async () => {
        currentTest.attachLabel('empty', 'true')
    })

    it('empty test with browser.reloadSession()', async () => {
        currentTest.setMaintainer('vasya')
        await browser.reloadSession()
        currentTest.attachLabel('reloaded', 'true')
    })

    it('should verify title search laptop and verify title', async () => {
        currentTest.setMaintainer('vasya')
        currentTest.attachArtifactReference('Zebrunner', 'https://zebrunner.com')

        await browser.url(`https://www.ebay.com`)

        await expect(browser).toHaveTitle('Electronics, Cars, Fashion, Collectibles & More | eBay')

        const searchInput = $('#gh-ac')
        const searchBtn = $('#gh-btn')

        await searchInput.addValue('laptop')
        await searchBtn.click()

        await expect(searchInput).toHaveValue('laptop')
        await expect(browser).toHaveTitle('laptop for sale | eBay')
    })

    it('should search telephones and verify title', async () => {
        const searchInput = $('#gh-ac')
        const searchBtn = $('#gh-btn')

        await searchInput.clearValue()
        await searchInput.addValue('telephones')
        await searchBtn.click()

        currentLaunch.attachArtifactReference('ebay', 'https://ebay.com')

        await expect(searchInput).toHaveValue('telephones')
        await expect(browser).toHaveTitle('telephones: Search Result | eBay')
    })

    afterEach(function () {
        logger.info('test finished')
        currentTest.attachLabel('in-after-each', 'true')
    })

    after(function () {
        currentLaunch.attachLabel('ebay-tests-finished', 'true')
    })

})

