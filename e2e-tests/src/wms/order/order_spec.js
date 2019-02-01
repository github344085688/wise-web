/**
 * Created by colinc on 8/20/16.
 */

var order = require('./order_page.js');
var searchOrder = new order.searchAddOder();

describe('order page', function () {
    // it('search order', function () {
    //     searchOrder.get();
    //     searchOrder.search();
    // });

    it('add order', function () {
        searchOrder.addOrder();
    });
})
