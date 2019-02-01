/**
 * Created by colinc on 8/20/16.
 */
var receiptPage = require('./receipt_page.js');
var receipt = new receiptPage.searchAddReceipt();

describe('receipt page', function () {
    // it('search receipt', function () {
    //     receipt.get();
    //     receipt.search();
    // });

    it('add receipt', function () {
        receipt.add();
    });
});
