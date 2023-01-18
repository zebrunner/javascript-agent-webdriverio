describe('Webdriverio main page', () => {

    it('should be right title', async () => {
        await browser.url(`https://webdriver.io`)
        await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
    })

})
