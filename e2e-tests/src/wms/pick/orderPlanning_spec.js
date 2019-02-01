/**
 * Created by colinc on 8/21/16.
 */

var orderPlanningPage = require('./orderPlanning_page.js');

var oderPlanning = new orderPlanningPage.createPickfromOrder();

describe('pick page', function () {
    it('search order planning', function () {
        oderPlanning.get();
        oderPlanning.searchOrderPlanning();
    });
});
