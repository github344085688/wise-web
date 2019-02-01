/**
 * Created by colinc on 8/17/16.
 */

var diffPage={};

diffPage.saveDiffPage=function () {
    this.save=function (url) {
        browser.get(url);
        browser.sleep(2000);
        var pageName = url.replace(/[^\w\s]/gi, '-');
        browser.pixdiff.saveScreen(pageName.toString());
    };
    this.diff=function (url) {
        browser.get(url);
        browser.sleep(2000);
        var pageName = url.replace(/[^\w\s]/gi, '-');
        expect(browser.pixdiff.checkScreen(pageName.toString())).toMatchScreen();
    }
};

module.exports=diffPage;