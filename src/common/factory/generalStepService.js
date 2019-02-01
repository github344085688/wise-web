'use strict';

define([
    './factories',
], function(factories, _) {
    factories.factory('generalStepService', function($resource, $mdDialog) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var service = {};
        service.searchStep = function(param) {
            return $resource("/wms-app/generic-step/search",{}, resourceConfig).search(param).$promise;
        };

        service.createStep = function(param) {
            return $resource("/wms-app/generic-step").save(param).$promise;
        };

        service.updateStep = function(step) {
            return $resource("/wms-app/generic-step/:stepId",{stepId:step.id},
                resourceConfig).update(step).$promise;
        };

        service.getStep = function(stepId) {
            return $resource("/wms-app/generic-step/:stepId", {stepId:stepId}).get().$promise;
        };

        service.deleteStep = function(stepId) {
            return $resource("/wms-app/generic-step/:stepId", {stepId:stepId}).delete().$promise;
        };
        
        service.updateStepAssignees = function (step) {
            $mdDialog.show({
                templateUrl: 'wms/outbound/task/template/editPickTask.html',
                locals: {
                    step: step
                },
                controller: editPickTaskController
            }).then(function (task) {
                angular.forEach($scope.pickTasks, function (item, key) {
                    if(item.id == task.id) {
                        $scope.pickTasks[key] = task;
                        if(task.plannedAssignee) {
                            $scope.userMap[task.plannedAssigneeUserId] = task.plannedAssignee;
                        }
                    }
                });
            }, function () {

            });
        }

        return service;
    });
});
