/**
 * Created by colinc on 8/21/16.
 */

var uiselect = require('../../util/uiselectByModel.js');
var commitmentReportPage = {};

commitmentReportPage.searchCommitment = function () {
    this.get = function () {
        browser.get('#/wms/outbound/inventory-commitment/commitmentReport');
    };

    this.search = function () {
        element(by.model('order.orderIds')).sendKeys('orderId');
        uiselect.fillSelect('order.statuses','Committed');
        uiselect.fillSelect('order.customerIds','VIZIO');
        uiselect.fillSelect('order.carrierIds','CH');
        uiselect.fillSelect('order.freightTerm','Prepaid');
        element(by.model('order.referenceNos')).element(by.model('newTag.text')).sendKeys('reference123');
        element(by.model('order.poNos')).element(by.model('newTag.text')).sendKeys('pono123');
        element(by.model('order.soNos')).element(by.model('newTag.text')).sendKeys('reference123');
        element(by.partialButtonText('Search')).click();
    };
};

module.exports=commitmentReportPage;
