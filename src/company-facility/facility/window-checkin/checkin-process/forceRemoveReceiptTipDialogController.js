'use strict';

define(['lodash'], function(_) {
    var controller = function($scope, $state, $mdDialog, entryId, receiptId, entryService, receiveTaskService) {

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.submit = function() {
            var forceRemoveReceipt = {forceRemoveReceiptIds: [receiptId],
                taskId: $scope.info.taskId, reason: $scope.info.reason};
            $scope.loading = true;
            entryService.forceRemoveReceipt(entryId, forceRemoveReceipt).then(function () {
                $scope.loading = false;
                $mdDialog.hide();
            }, function (error) {
                $scope.info.error = error.data.error;
                $scope.loading = false;
            });
        };
        
        function init() {
            receiveTaskService.searchTasksBasicInfo({entryId: entryId, receiptId: receiptId}).then(function (tasks) {
                if(tasks && tasks.length > 0) {
                    $scope.info = {error: "", taskId: tasks[0].id, receiptId: receiptId};
                }
            });
        }

        init();
    };

    controller.$inject = ['$scope', '$state', '$mdDialog', 'entryId', 'receiptId', 'entryService', 'receiveTaskService'];
    return controller;

});
