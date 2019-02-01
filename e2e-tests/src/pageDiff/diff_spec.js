/**
 * Created by colinc on 8/17/16.
 */
var diffPage = require('./diff_page.js');
var Urls = ["#/fd/item/itemspec",
    "#/fd/item/ipg/add",
    "#/fd/organization/add",
    "#/fd/address/add",
    "#/fd/sop/add"
];

describe('diffPage', function () {

    // it('save all the base pages', function () {
    //     var savePages = new diffPage.saveDiffPage();
    //     Urls.forEach(function (url) {
    //         savePages.save(url);
    //     })
    // });

    Urls.forEach(function (url) {
        var pageUrl = url.toString();
        it("diff for the page: " + pageUrl, function () {
            var savePages = new diffPage.saveDiffPage();
            savePages.diff(pageUrl);
        });
    });

});