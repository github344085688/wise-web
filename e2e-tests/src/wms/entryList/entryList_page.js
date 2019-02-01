/**
 * Created by colinc on 8/21/16.
 */

var uiselect = require('../../util/uiselectByModel.js');
var entryListPage = {};

entryListPage.searchCreateEntry = function () {
    this.get = function () {
        browser.get('#/wms/window/entry/entryList');
    };

    this.searchEntry= function () {
        uiselect.fillSelect('search.carrierId','CH');
        element(by.model('search.driverName')).sendKeys('test');
        element(by.model('search.driverLicense')).sendKeys('test');
        element(by.model('search.mcDot')).sendKeys('test');
        element(by.model('search.tractor')).sendKeys('test');
        element(by.model('search.trailer')).sendKeys('test');
        element(by.model('search.containerNO')).sendKeys('test');
        uiselect.fillSelect('search.statuses','Walking');
        $("input[class=form-control]").val('');
        element(by.partialButtonText('Search')).click();
        expect(element.all(by.repeater('entry in entryList track')).count()).toBe(1);

    };

    this.createEntry = function () {
        element(by.partialButtonText('Create Entry')).click();
        element(by.repeater('action in entryActionList')).click();
        element(by.partialButtonText(' OK ')).click();
        element(by.partialButtonText('Yes')).click();

        element(by.model('carrierInfo.mcDot')).sendKeys('mcDot');
        uiselect.fillSelect('carrierInfo.carrierId','CH');
        element(by.model('carrierInfo.driverName')).sendKeys('driver name');
        element(by.model('carrierInfo.driverLicense')).sendKeys('12332123');
        element(by.model('carrierInfo.tractor')).sendKeys('tractor');
        element(by.model('carrierInfo.trailer')).sendKeys('trailer');
        element(by.model('containerNOs')).sendKeys('123');
        element(by.partialButtonText('Save')).click();
        element(by.partialButtonText('OK')).click();
        element(by.partialButtonText('Continue')).click();

    }
};

module.exports=entryListPage;
