'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $mdDialog, $state, $stateParams, isAddAction, lincUtil, titleVirtualLocationGoupService) {

        var CREATE_TITLE = "Add  Title Virtual Location Group";
        var EDIT_TITLE = "Edit Title Virtual Location Group";
        $scope.group = {};
 
        $scope.submit = function () {
            var group = angular.copy($scope.group);
            if (!isAddAction) {
                editGroup(group);
            }
            else {
                addGroup(group);
            }
        };

        function addGroup(param) {
            $scope.loading = true;
            titleVirtualLocationGoupService.create(param).then(function () {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('cf.facility.resource.virtualLocationGroup.titleVlgMapping.list');
                });
            }, submitFail);
        }

        function editGroup(param) {
            $scope.loading = true;
            titleVirtualLocationGoupService.update(param).then(function () {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('cf.facility.resource.virtualLocationGroup.titleVlgMapping.list');
                });
            }, submitFail);
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.virtualLocationGroup.titleVlgMapping.list');
        };



        $scope.titleCustomCtrl = {};
        $scope.customerChange = function (customer) {
            $scope.titleCustomCtrl.manualRefreshOptions(customer.id);
        };

        function getGroupById(groupId) {
            titleVirtualLocationGoupService.getById(groupId).then(function (response) {
                $scope.group = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function _init() {
            $scope.isAddAction = isAddAction;
            if (isAddAction) {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
            } else {
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getGroupById($stateParams.groupId);
            }
        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'isAddAction', 'lincUtil', 'titleVirtualLocationGoupService'];

    return controller;
});

