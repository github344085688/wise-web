/**
 * Created by colinc on 8/16/16.
 */
var address = require('./address_page.js');
describe('address',function () {
    it('add a new address and delete it',function () {
        var operateAddress = new address.addDeleteAddress();
        operateAddress.get();
        var result = operateAddress.searchAddress();
        expect(result.count()).toBe(0);
        operateAddress.addNewAddress();
        operateAddress.get();
        result = operateAddress.searchAddress();
        browser.sleep(1000);
        expect(result.count()).toBe(1);
        operateAddress.deleteAddress();
        operateAddress.get();
        result = operateAddress.searchAddress();
        browser.sleep(1000);
        expect(result.count()).toBe(0);
    });
});