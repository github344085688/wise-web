'use strict';

define([
    'angular',
    'lodash',
    './selectLocationController'
], function (angular, _, selectLocationController) {
    var controller = function ($scope, $mdDialog, $state, lincUtil, locationService, $q) {

        var originVirtualLocation;
        $scope.submit = function () {
            var virtualLocationGroupParams = angular.copy($scope.virtualLocationGroups);
            editVirtualLocationGroup(virtualLocationGroupParams).then(submitSuccessPopUp, submitFail)
        };


        function editVirtualLocationGroup(virtualLocationGroupParams) {
            $scope.loading = true;
            var promises = [];
            virtualLocationGroupParams.forEach(function (virtualLocationGroup) {
                if (virtualLocationGroup.userIds) {
                    var originUserIds = originVirtualLocation[virtualLocationGroup.id].userIds ? originVirtualLocation[virtualLocationGroup.id].userIds : [];
                    var difVal = _.xor(originUserIds, virtualLocationGroup.userIds);
                    if (difVal.length > 0) {
                        var promise = locationService.updateVirtualLocationGroup(virtualLocationGroup.id, { userIds: virtualLocationGroup.userIds });
                        promises.push(promise);
                    }

                }

            });
            return $q.all(promises);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.updateSuccessfulPopup(function () {
                 $state.go('cf.facility.resource.virtualLocationGroup.groupManagement.list');
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.virtualLocationGroup.groupManagement.list');
        };


        function searchVirtualLocationGroup(param) {
            locationService.searchVirtualLocationGroup(param).then(function (response) {
                $scope.virtualLocationGroups = response;
                originVirtualLocation = _.keyBy(angular.copy(response), 'id');
            }, function (error) {
                lincUtil.processErrorResponse(error);

            });
        }


        function _init() {
            searchVirtualLocationGroup({ 'virtualLocationGroupType': "Zone" });
        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', 'lincUtil', 'locationService', '$q'];

    return controller;
});

