'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, lincResourceFactory, conveyorService, $stateParams) {

      $scope.conveyorBranch={};
      $scope.ConveyorLineList=[];


      function init() {
        getConveyorLineList();
        $scope.isAddAction = $stateParams.branchId ? false : true;
        if ($scope.isAddAction) {
            $scope.submitLabel = "Save";
            if($stateParams.lineId)  $scope.conveyorBranch.conveyorLineId = $stateParams.lineId;
        } else {
            $scope.submitLabel = "Update";
            $scope.loading = true;
            conveyorService.getConveryBranch($stateParams.branchId).then(function(response){
                $scope.conveyorBranch=response;
                $scope.conveyorBranch.name = parseInt($scope.conveyorBranch.name);
                $scope.loading = false;
            },function(error){
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            })
        }

    }

    init();


    $scope.addOrUpdateConveyorBranch = function () {

            var param = angular.copy($scope.conveyorBranch);
            if (!$scope.isAddAction) {
                editConveyorBranch(param);
            }
            else {
                addConveyorBranch(param);
            }
    };

    function addConveyorBranch(conveyorBranch){
        $scope.loading = true;
        conveyorService.conveyorBranchCreate(conveyorBranch).then(function(response){
           lincUtil.saveSuccessfulPopup();
           $state.go("cf.facility.resource.conveyorBranch.list");
           $scope.loading = false;
        },function(error){
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        });

    }

    function editConveyorBranch(conveyorBranch){
        $scope.loading = true;
        conveyorService.converyBranchUpdate($stateParams.branchId,conveyorBranch).then(function(response){
            lincUtil.saveSuccessfulPopup();
            $state.go("cf.facility.resource.conveyorBranch.list");
            $scope.loading = false;
        },function(error){
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        )
    }


    function getConveyorLineList(){
        conveyorService.converyLineSearch({}).then(function (response) {
        $scope.ConveyorLineList = response;
      }, function (error) {
        lincUtil.processErrorResponse(error);
        });
      }

    $scope.cancelEditConveyor = function () {
        $state.go("cf.facility.resource.conveyorBranch.list");
    };

    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'lincResourceFactory', 'conveyorService','$stateParams'];
    return controller;
});