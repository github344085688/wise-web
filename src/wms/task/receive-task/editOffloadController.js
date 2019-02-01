'use strict';

define([], function() {
    var ctrl = function($scope, $stateParams, $state, receiveTaskService, lincUtil) {
        $scope.buttonName = "Update";
        $scope.offloadTypes=['BY_HAND_NO_PALLET', 'FORKLIFT_NO_PALLET','FORKLIFT_WITH_PALLET']
        receiveTaskService.get($stateParams.taskId).then(function(data){
            $scope.task = data ;
            $scope.task.steps.forEach(function(step){
                switch (step.name) {
                    case 'Offload':
                        receiveTaskService.getOffloadDetail(step.id).then(function(data){
                             $scope.task.offload = data;
                        });
                        break;
                }
            });
        },function(error){
            lincUtil.processErrorResponse(error);
        });

        $scope.getPhotoType = function (type) {
            if("CONTAINER_NO_CHECK" === type) {
                return "Container No";
            }
            if("SEAL_CHECK" === type) {
                return "Seal No";
            }
            if("OFFLOAD" === type) {
                return "Offload";
            }
        };

        $scope.submit = function () {
            var offload = angular.copy($scope.task.offload);
            if(offload)
            {
                $scope.loading = true;
                receiveTaskService.updateOffload(offload).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go('wms.task.receiveTask.view', {taskId:$scope.task.id});
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        $scope.cancel = function() {
            $state.go('wms.task.receiveTask.view', {"taskId":$stateParams.taskId});
        };

    };
    ctrl.$inject = ['$scope','$stateParams', '$state',  'receiveTaskService', 'lincUtil'];
    return ctrl;
});
