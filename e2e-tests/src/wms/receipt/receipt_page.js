/**
 * Created by colinc on 8/20/16.
 */

var uiselect = require('../../util/uiselectByModel.js');

var receiptPage= {};

receiptPage.searchAddReceipt=function () {
    this.get=function () {
        browser.get('#/wms/inbound/receipt/list');
    };

    this.search=function () {
        element(by.model('receipt.receiptIds')).element(by.model('newTag.text')).sendKeys('RN-28');
        uiselect.fillSelect('receipt.statuses','Closed');
        uiselect.fillSelect('receipt.customerIds','VIZIO');
        uiselect.fillSelect('receipt.titleIds','VIZIO');
        uiselect.fillSelect('receipt.carrierIds','CH');
        element(by.model('receipt.containerNos')).element(by.model('newTag.text')).sendKeys('CCLU1234561');
        element(by.model('receipt.sealNos')).element(by.model('newTag.text')).sendKeys('seal12345');
        element(by.model('receipt.bolNos','SO123456'));
        element(by.partialButtonText('Search')).click();
        expect(element.all(by.repeater('item in receiptView | orderBy:orderBy')).count()).toBe(1);
    };

    this.add=function () {
        browser.get('#/wms/inbound/receipt/add');
        uiselect.fillSelect('receipt.customerId','VIZIO');
        uiselect.fillSelect('receipt.titleId','VIZIO');
        uiselect.fillSelect('receipt.carrierId','CH');
        uiselect.fillSelect('receipt.supplierId','CH');
        element(by.model('receipt.containerNo')).sendKeys('CTNR1234567');
        element(by.model('receipt.referenceNo')).sendKeys('reference123');
        element(by.model('receipt.poNos')).element(by.model('newTag.text')).sendKeys('pono123');
        element(by.model('receipt.bolNos')).element(by.model('newTag.text')).sendKeys('bono123');
        element(by.model('receipt.sealNo')).sendKeys('sealno123');
        element(by.model('receipt.note')).sendKeys('note for test');
        element(by.partialButtonText('Submit')).click();
        element(by.partialButtonText('OK')).click();



    };
};

module.exports=receiptPage;