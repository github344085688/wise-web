/**
 * Created by colinc on 8/16/16.
 */
var uiselect = require('../../util/uiselectByModel.js');
var handingSOP ={};

handingSOP.addDeleteHandingSOP=function () {
    this.getAddPage=function () {
        browser.get('#/fd/sop/add');
    };
    
    this.getSearchPage=function () {
        browser.get('#/fd/sop/list');
    }

    this.searchHandingSOP=function (content) {
        browser.get('#/fd/sop/list');
        element(by.model('searchInfo.content')).clear().sendKeys('for test');
        element(by.partialButtonText('Search'));
    };

    this.addHandingSOP=function () {
        browser.get('#/fd/sop/add');
        uiselect.fillSelect('ctrl.sop.customer','VIZIO');
        uiselect.fillSelect('ctrl.sop.title','VIZIO');
        uiselect.fillSelect('ctrl.sop.supplier','AMTRAN');
        uiselect.fillSelect('ctrl.sop.brand','VIZIO');
        uiselect.fillSelect('ctrl.sop.carrier','CH');
        uiselect.fillSelect('ctrl.sop.retailer','WALMART');
        uiselect.fillSelect('ctrl.sop.item','V1');
        uiselect.fillSelect('ctrl.sop.step','RECEIVE');
        element(by.model('ctrl.sop.content')).sendKeys('for test');
        // browser.sleep(500);
        element(by.partialButtonText('Save')).click();
        element(by.partialButtonText('OK')).click();
        // browser.sleep(1000);
    };

    this.deleteHandingSOP=function () {
        element(by.linkText('Disable')).click();
        // browser.sleep(500);
        element(by.partialButtonText('Yes')).click();
        // browser.sleep(500);
    };

    this.varifyExpectedResult=function (num) {
        // browser.sleep(1000);
        expect(element(by.id('sample_1')).all(by.className('ng-scope')).count()).toBe(num);
    };
}

module.exports=handingSOP;