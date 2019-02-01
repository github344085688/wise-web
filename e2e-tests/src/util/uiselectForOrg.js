var uiselect = {
    fillSelect: function (el, value) {
        var selectInput = el.element(by.css('.ui-select-search'));
        el.click();
        selectInput.sendKeys(value);
        // browser.sleep(1000);
        // if (expect(browser.isElementPresent(element(by.css('.ui-select-choices-row-inner')))).toBe(true)){
        //     el.element(by.css('.ui-select-choices-row-inner')).click();
        // }
        // else if (expect(browser.isElementPresent(element(by.css('ui-select-choices-row-inner span')))).toBe(true)) {
        el.element(by.css('.ui-select-choices-row-inner span')).click();
        // }
        // // else if (expect(browser.isElementPresent(element(by.css('.ui-select-choices-row-inner')))).toBe(false)){
        // el.element(by.css('.ui-select-choices-row-inner')).click();
        // // }

        // el.element(by.css('.ui-select-choices-row-inner')).click();
        // element(by.cssContainingText('.ng-binding ng-scope', value)).click();
    }
};
module.exports = uiselect;