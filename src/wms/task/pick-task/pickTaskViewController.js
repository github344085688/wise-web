'use strict';

define(['lodash', 'angular'], function(_, angular) {
    var ctrl = function($scope, $state, $stateParams, pickService, lincUtil) {

        $scope.firstLoading = false;
        function init() {
            $scope.materialLinesSearchParam = {pickTaskIds: [$stateParams.taskId]};
            $scope.activetab = [];
            $scope.isLoading = true;
            pickService.getPickTaskView($stateParams.taskId).then(function(data){
                $scope.task = data;
                $scope.initTab($scope.task);
                $scope.isLoading = false;
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }
  
        init();

        $scope.printShippingLabel=function(task){
           
            if(!task) return;
            $scope.printShippingtLabeling=true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "printShippingtLabeling");
            var url = $state.href('wms.task.pickTask.prePrintShippingLabel',{ taskId: task.id });
            window.open(url);
        };

        $scope.printPalletLabel = function(task) {
            if(!task) return;
            $scope.printPalletLabeling=true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "printPalletLabeling");
            var url = $state.href('ordersPalletLabelPrint', { orderIds: task.orderIds  });
            window.open(url);
        };

        $scope.printPickTicketLabel = function (taskId) {
            var url = $state.href('pickTicketLabelPrint',{ taskId: taskId });
            window.open(url);
        };

        $scope.initTab = function (task) {
            $scope.activetab = "itemLines";
            $scope.activeStepTabs = {};
            angular.forEach(task.steps, function (step) {
                $scope.activeStepTabs[step.id] = "content";
            });
        }

        $scope.changeTab= function (tab) {
            $scope.activetab = tab;
        };

        $scope.changeStepTab = function (tab, stepId) {
            $scope.activeStepTabs[stepId] = tab;
        };

        $scope.cancel = function() {
            $state.go('wms.task.pickTask.list');
        };

        $scope.editTask = function (taskId) {
           $state.go('wms.task.pickTask.edit', {
               taskId: taskId
           });
        };
        
        $scope.reopenTask = function (task) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this pick task?', function () {
                pickService.reopenPickTask(task.id).then(function () {
                    lincUtil.messagePopup("Info", "Reopen pick task successful.");
                    init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.separateTask = function (task) {
            if(task.pickWay.indexOf("By Order") > -1) {
                $state.go('wms.task.pickTask.by-order-separate', {
                    taskId: task.id
                });
            }else {
                $state.go('wms.task.pickTask.by-item-separate', {
                    taskId: task.id
                });
            }
        };

        $scope.mergeTask = function (task) {
            $state.go('wms.task.pickTask.merge', {
                taskId: task.id
            });
        };

        $scope.reopenStep = function (step) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this step?', function () {
                pickService.reopenStep($scope.task.id, step.id).then(function () {
                    lincUtil.updateSuccessfulPopup(function () {
                        step.status = "In Progress";
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

    };
    ctrl.$inject = ['$scope', '$state','$stateParams', 'pickService', 'lincUtil'];
    return ctrl;
});
