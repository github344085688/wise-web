/**
 * Created by colinc on 8/20/16.
 */

var receiptTask={};

receiptTask.searchTask=function () {
    this.get = function () {
        browser.get('#/wms/inbound/receive-task/list');
    };

    this.search=function () {
        element(by.model('ctrl.searchInfo.entryId')).sendKeys('ET-45');
        element(by.model('ctrl.searchInfo.taskId')).sendKeys('TASK-21');
        element(by.partialButtonText('Search')).click();
        expect(element.all(by.repeater('receiveTask in ctrl.receiveTasksView')).count()).toBe(1);
    }
};

module.exports=receiptTask;
