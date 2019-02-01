'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, conveyorService, $stateParams) {

      $scope.conveyorLine={};



      function init() {



        $scope.isAddAction = $stateParams.lineId ? false : true;
        if ($scope.isAddAction) {
            $scope.submitLabel = "Save";

        } else {
            $scope.submitLabel = "Update";
            conveyorService.getConveryLine($stateParams.lineId).then(function(response){
                $scope.conveyorLine=response;
            },function(error){
                lincUtil.processErrorResponse(error);
            })
        }

    }

    init();


    $scope.addOrUpdateConveyorLine = function () {

            var param = angular.copy($scope.conveyorLine);
            if (!$scope.isAddAction) {
                editConveyorLine(param);
            }
            else {
                addConveyorLine(param);
            }
    };

    function addConveyorLine(conveyorLine){
        $scope.loading = true;
        conveyorService.conveyorLineCreate(conveyorLine).then(function(response){
           lincUtil.saveSuccessfulPopup();
           $state.go("cf.facility.resource.conveyorLine.list");
           $scope.loading = false;
        },function(error){
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        });

    }

    function editConveyorLine(conveyorLine){
        $scope.loading = true;
        conveyorService.updateConveryLine($stateParams.lineId,conveyorLine).then(function(response){
            lincUtil.saveSuccessfulPopup();
            $state.go("cf.facility.resource.conveyorLine.list");
            $scope.loading = false;
        },function(error){
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        )
    }

    $scope.cancelEditConveyor = function () {
        $state.go("cf.facility.resource.conveyorLine.list");
    };

    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'conveyorService','$stateParams'];
    return controller;
});