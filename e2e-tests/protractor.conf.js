// var baseUrl = 'http://127.0.0.1:8000/src'
var baseUrl = 'http://52.193.39.39'

exports.config = {
    allScriptsTimeout: 11000,

    suites: {
        // organization: 'src/fd/organization/*_spec.js',
        // item: 'src/fd/item/*_spec.js',
        // address: 'src/fd/address/*_spec.js',
        // handing_SOP: 'src/fd/handing_SOP/*_spec.js',
        // diffPages: 'src/pageDiff/*_spec.js',
        // order: 'src/wms/order/*_spec.js',
        // receipt: 'src/wms/receipt/*_spec.js',
        // receiptTask: 'src/wms/receiptTask/*_spec.js',
        // inventoryCommitment: 'src/wms/inventoryCommitment/*_spec.js'
        // entryList : 'src/wms/entryList/*_spec.js',
        appointment:'src/wms/appointment/*_spec.js'
    },

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: baseUrl,
    seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

    framework: 'jasmine',

    onPrepare: function () {

        var PixDiff = require('pix-diff');

        browser.pixdiff = new PixDiff(
            {
                basePath: '/Users/colinc/stash/linc-web/screenshots',
                capabilities: {
                    'browserName': 'chrome'
                },
                width: 1280,
                height: 1024
            }
        );

        browser.driver.manage().window().maximize();
        // browser.get(baseUrl + '/#/login.html');

        browser.get(baseUrl + '/#/login');

        browser.findElement(by.name('username')).sendKeys('bruceh');
        browser.findElement(by.name('password')).sendKeys('qwer1234');
        browser.findElement(by.partialButtonText('Sign In')).click();

        return browser.wait(function () {
            return browser.getCurrentUrl().then(function (url) {
                return /home/.test(url);
            });
        }, 10000);
    },

    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    }


};
