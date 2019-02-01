'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, $stateParams, replenishmentTaskService, $state , $http, lincUtil) {
        init();
        function init() {
            if ($stateParams.taskId) {
                getTask($stateParams.taskId);
            }
        }

        function getTask(taskId) {
            replenishmentTaskService.getTaskById(taskId).then(function(response)
            {
                $scope.task = response.task;
                initActiveTabs($scope.task.steps);
                $scope.replenishmentProcessesGroupByStepId = response.replenishmentProcessesGroupByStepId;
            }, function (error) {
                lincUtil.processErrorResponse(error);    
            });
        }

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };

        $scope.editTask = function () {
            $state.go("wms.task.replenishmentTask.edit", { taskId: $scope.task.id});
        };

        function initActiveTabs(steps) {
            $scope.activeTabs = {};
            angular.forEach(steps, function (step) {
                $scope.activeTabs[step.id] = "content";
            });
        }
        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post('/wms-app/replenishment-task/' + $scope.task.id + '/export',{},{
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "ReplenishmentTask.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };
    };
    ctrl.$inject = ['$scope','$stateParams', 'replenishmentTaskService', '$state', '$http', 'lincUtil'];

    return ctrl;
});
