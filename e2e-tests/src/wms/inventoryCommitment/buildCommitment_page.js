/**
 * Created by colinc on 8/20/16.
 */

var uiselect = require('../../util/uiselectByModel.js');

var buildCommitmentPage = {};

buildCommitmentPage.searchCommitment = function () {
    this.get = function () {
        browser.get('#/wms/outbound/inventory-commitment/buildCommitment');
    };

    this.search =function () {
        element(by.model('order.orderIds')).element(by.model('newTag.text')).sendKeys('DN-17');
        uiselect.fillSelect('order.statuses','Imported');
        uiselect.fillSelect('order.customerIds','VIZIO');
        uiselect.fillSelect('order.carrierIds','CH');
        // uiselect.fillSelect('order.freightTerm','Imported');
        element(by.model('order.referenceNos')).element(by.model('newTag.text')).sendKeys('reference123');
        element(by.partialButtonText('Search')).click();
        expect(element.all(by.repeater('order in orders')).count()).toBe(1);
        element(by.className('caption-subject bold ng-binding')).click();
        element(by.partialButtonText('Commit')).click();
        expect(element(by.className('md-default-theme md-transition-in')).getText()).not.toContain('Error');
        element(by.partialButtonText('OK')).click();

    };
}

module.exports=buildCommitmentPage;
