/**
 * Created by colinc on 8/16/16.
 */
var handingSOP = require('./handing_sop_page.js');
describe('Handing SOP', function () {
    it('add and delete a new handing SOP', function () {
        var operateHandingSOP = new handingSOP.addDeleteHandingSOP();
        operateHandingSOP.searchHandingSOP('for test');
        operateHandingSOP.varifyExpectedResult(0);
        operateHandingSOP.addHandingSOP();
        operateHandingSOP.searchHandingSOP('for test');
        operateHandingSOP.varifyExpectedResult(1);
        operateHandingSOP.deleteHandingSOP();
        operateHandingSOP.searchHandingSOP('for test');
        operateHandingSOP.varifyExpectedResult(0);
    });
    // it("should match the page", function () {
    //     browser.get('#/fd/address/list');
    //     browser.sleep(2000);
    //     browser.pixdiff.saveScreen('addressPage');
    //     browser.get('#/fd/address/list');
    //     browser.sleep(2000);
    //     expect(browser.pixdiff.checkScreen('addressPage')).toMatchScreen();
    // });
});