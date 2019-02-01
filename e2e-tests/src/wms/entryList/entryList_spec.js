/**
 * Created by colinc on 8/21/16.
 */

var entryListPage = require('./entryList_page.js');
var entryList = new entryListPage.searchCreateEntry();

describe('entry list page', function () {
    it('search entry', function () {
        entryList.get();
        entryList.searchEntry();
    });
    it('create entry', function () {
        entryList.get();
        entryList.createEntry();
    })
})