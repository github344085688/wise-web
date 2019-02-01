/**
 * Created by colinc on 8/20/16.
 */
var receiptTask = require('./receiptTask_page.js');

var receipt = new receiptTask.searchTask();

describe('receipt task page', function () {
    it('search receipt task', function () {
        receipt.get();
        receipt.search();
    });
});