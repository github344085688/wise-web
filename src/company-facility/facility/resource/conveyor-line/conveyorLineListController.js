'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, lincResourceFactory, conveyorService) {

        $scope.conveyorLineParam={};

         $scope.search = function (){
            var param = angular.copy($scope.conveyorLineParam);
            searchConveryLine(param);
         }


        function searchConveryLine(param) {
            $scope.loading = true;
            conveyorService.converyLineSearch(param).then(function (response) {
                $scope.conveyorLineList = response;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.delete = function (lineId) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this line?", function () {
                conveyorService.converyLineDelete(lineId).then(function (response) {
                    lincUtil.messagePopup('Message', 'Delete Successful.');
                    _init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
                
            });
        };

        function _init() {
            searchConveryLine({});
        }

        _init();





    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'lincResourceFactory', 'conveyorService'];
    return controller;
});