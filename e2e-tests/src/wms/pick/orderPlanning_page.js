/**
 * Created by colinc on 8/21/16.
 */

var uiselect = require('../../util/uiselectByModel.js');

var orderPlanningPage = {};

orderPlanningPage.createPickfromOrder = function () {

    this.get = function () {
        browser.get('#/wms/outbound/pick/order-planning');
    };

    this.searchOrderPlanning = function () {
        uiselect.fillSelect('orderPlanning.pickType','bulk');
        uiselect.fillSelect('orderPlanning.pickWay', 'order');
        uiselect.fillSelect('orderPlanning.locationIds','test');
        uiselect.fillSelect('orderPlanning.customerIds','test');
        uiselect.fillSelect('orderPlanning.itemSummaries','item');
        element(by.partialButtonText('Search')).click();
    }
}

module.exports=orderPlanningPage;
