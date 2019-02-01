/**
 * Created by colinc on 8/20/16.
 */
var uiselect = require('../../util/uiselectByModel.js');
var findByText = require('../../util/findByText.js');

var orderPage = {};

orderPage.searchAddOder=function () {
    this.get = function () {
        browser.get('#/wms/outbound/order/list');
    };

    this.search = function () {
        $('.btn.default.date-set').click();
        // uiselect.fillSelect('order.orderIds','DN-16');
        element(by.model('order.orderIds')).element(by.model('newTag.text')).sendKeys('DN-16');
        uiselect.fillSelect('order.statuses','Loaded');
        uiselect.fillSelect('order.customerIds','VIZIO');
        uiselect.fillSelect('order.carrierIds', 'CH');
        uiselect.fillSelect('order.freightTerm','Prepaid');
        element(by.model('order.referenceNos')).element(by.model('newTag.text')).sendKeys('850000000');
        element(by.partialButtonText('Search')).click();
        expect(element.all(by.repeater('item in orderView | orderBy:orderBy')).count()).toBe(1);
    };

    this.addOrder=function () {
        browser.get('#/wms/outbound/order/add');
        uiselect.fillSelect('order.customerId','VIZIO');
        uiselect.fillSelect('order.carrierId', 'CH');
        uiselect.fillSelect('order.freightTerm','Prepaid');
        element(by.model('order.referenceNo')).sendKeys('117654321');
        element(by.model('order.poNos')).element(by.model('newTag.text')).sendKeys('123');
        element(by.model('order.soNos')).element(by.model('newTag.text')).sendKeys('321');
        element(by.model('order.orderNote')).sendKeys('test for order note');
        element(by.model('order.labelNote')).sendKeys('test for label note');
        element(by.model('order.packNote')).sendKeys('test for pack note');
        // expect(element.all(by.addLocator('Edit', findByText)).count()).toBe(3);
        element(by.xpath('//label[@lt-address-model="order.billTo"]')).click();
        element(by.model('searchInfo.anytext')).sendKeys('E2EOrg_add');
    };
}


module.exports= orderPage;

