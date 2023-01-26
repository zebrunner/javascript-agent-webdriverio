const { currentTest, currentLaunch } = require("../../src");

describe('My Login application', () => {

    before(function () {
        currentLaunch.attachLabel("test_run", "run_one", "run_two");
    })

    it('should login with valid credentials', async () => {
        currentTest.setTestRailCaseId("3435", "3438");
        currentTest.setXrayTestKey("QT-2", "QT-10", "QT-11");
        currentTest.attachLabel("some key", "one", "two", "three");

        await browser.url(`https://the-internet.herokuapp.com/login`)

        await $('#username').setValue('tomsmith')
        await $('#password').setValue('SuperSecretPassword!')
        await $('button[type="submit"]').click()

        await expect($('#flash')).toBeExisting()
        await expect($('#flash')).toHaveTextContaining('You logged into a secure area!')
    })

    it('should fail with invalid credentials', async () => {
        currentTest.setTestRailCaseId("3436");
        currentTest.setXrayTestKey("QT-10");
        currentTest.attachLabel("reason", "invalid creds");

        await browser.url(`https://the-internet.herokuapp.com/login`)

        await $('#username').setValue('tomsmith')
        await $('#password').setValue('SuperSecretPassword!!!')
        await $('button[type="submit"]').click()

        await expect($('#flash')).toBeExisting()
        await expect($('#flash')).toHaveTextContaining('You logged into a secure area!')
    })

    it.skip('should skip', async () => {
        currentTest.setTestRailCaseId("3437");
        currentTest.setXrayTestKey("QT-11");
        currentTest.attachLabel("reason", "skip");
    })

})
