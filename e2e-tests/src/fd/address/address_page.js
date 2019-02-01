/**
 * Created by colinc on 8/16/16.
 */
var uiselect = require('../../util/uiselect.js');
var address ={};

address.addDeleteAddress=function () {
    this.get=function () {
        browser.get('#/fd/address/list');
    };

    this.searchAddress=function () {
        element(by.model('ctrl.searchInfo.organizationName')).sendKeys('E2EOrg_add');
        element(by.model('ctrl.searchInfo.anytext')).sendKeys('nameForTest');
        return element(by.className('portlet-body')).all(by.className('ng-scope'));
    };

    this.addNewAddress=function () {
        browser.get('#/fd/address/add');
        uiselect.fillSelect(element(by.model('ctrl.address.organizationId')),'E2EOrg_add');
        element(by.model('ctrl.address.name')).sendKeys('nameForTest');
        element(by.model('ctrl.address.state')).sendKeys('stateForTest');
        element(by.model('ctrl.address.city')).sendKeys('cityForTest');
        element(by.model('ctrl.address.zipCode')).sendKeys('77001');
        element(by.model('ctrl.address.fax')).sendKeys('123');
        element(by.model('ctrl.address.address')).sendKeys('123 main');
        element(by.model('contact.name')).sendKeys('contactName');
        element(by.model('contact.phone')).sendKeys('1231231234');
        element(by.model('contact.email')).sendKeys('LT-TEST@LT.com');
        uiselect.fillSelect(element(by.model('contact.type')),'OTHER');
        element(by.partialButtonText('Add')).click();
        element(by.partialButtonText('Save')).click();
        element(by.partialButtonText('OK')).click();
    };
    
    this.deleteAddress=function () {
        browser.get('#/fd/address/list');
        element(by.model('ctrl.searchInfo.organizationName')).sendKeys('E2EOrg_add');
        element(by.model('ctrl.searchInfo.anytext')).sendKeys('nameForTest');
        element(by.linkText('Remove')).click();
        element(by.partialButtonText('Yes')).click();
    }
};

module.exports=address;