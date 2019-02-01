'use strict';

define(["angular"], function (angular) {

    var controller = function ($scope, $state, $stateParams, lincUtil,
        isAddAction, uomPickTypeService, itemService, uomDefinitionService) {

        $scope.pickTypes = ['Bulk Pick', 'Pallet Pick', 'Piece Pick', 'Case Pick', 'None']

        function init() {
            $scope.isAddAction = isAddAction;
            searchUomDefinition({});
            if (!isAddAction) {
                $scope.submitLabel = "Update";
                uomPickTypeService.getUomPickTypeById($stateParams.id).then(function (data) {
                    $scope.uomPickType = data;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            } else {
                $scope.submitLabel = "Save";
                $scope.uomPickType = {};
            }
        }
        init();

        function searchUomDefinition(param, callBack) {
            uomDefinitionService.searchUomDefinition(param).then(function (response) {
                if (!$scope.uomPickType.customerId) {
                    $scope.units = _.filter(response.uomDefinitions, function (uomDefini) {
                        return !uomDefini.customerIds || uomDefini.customerIds.length === 0;
                    });
                } else {
                    $scope.units = response.uomDefinitions;
                }

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.onSelect = function () {
            $scope.uomPickType.referenceUnit = null;
            if (!$scope.uomPickType.customerId || !$scope.uomPickType.itemSpecId) {
                $scope.units = [];
                $scope.uomPickType.itemSpecId = null;
            }
            if ($scope.uomPickType.itemSpecId) {
                itemService.searchItemUnits({
                    itemSpecId: $scope.uomPickType.itemSpecId
                }).then(function (response) {
                    $scope.units = response.units;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            } else {
                searchUomDefinition({
                    customerId: $scope.uomPickType.customerId
                });
            }


        };

        $scope.submitUomPickType = function () {
            var uomPickType = angular.copy($scope.uomPickType);
            $scope.loading = true;
            if (isAddAction) {
                createCode(uomPickType);
            } else {
                updateCode(uomPickType);
            }
        };

        function createCode(param) {
            uomPickTypeService.createUomPickType(param).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go("fd.uomPickType.list");
                });
            }, accessServiceFail);
        }

        function updateCode(param) {
            uomPickTypeService.updateUomPickType(param).then(function (res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go("fd.uomPickType.list");
                });
            }, accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go("fd.uomPickType.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'isAddAction', 'uomPickTypeService', 'itemService', 'uomDefinitionService'
    ];

    return controller;
});