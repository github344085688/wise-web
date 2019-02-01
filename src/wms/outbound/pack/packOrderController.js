'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, packService, itemService, $state, $stateParams, lincUtil) {
        var PCK = {
            "packageId": "PACKAGE-",
            "packItemLines": []
        };

        $scope.packageIsFull = function() {
            $scope.order.packages.push(angular.copy(PCK));
            $scope.qtyChange();
        };

        $scope.removePackage = function(index) {
            $scope.order.packages.splice(index, 1);
            $scope.qtyChange();
        };

        $scope.getContainerTypeList = function(param) {
            itemService.getItemByGroupType('Material').then(function(response) {
                $scope.containerTypes = response;
            });
        };

        $scope.packageChange = function(itemSpec) {
            itemService.getDiverseByItemSpec(itemSpec.id).then(function(response) {
                $scope.diverseItemSpecs = response.diverseItemSpecs;
                $scope.itemPropertyMap = response.itemPropertyMap;
            });
        };

        $scope.getDiverse = function(diverseItemSpec) {
            var diverse = "";
            if(!diverseItemSpec){
                return "";
            }
            _.forEach(diverseItemSpec.diverseProperties, function(property) {
                var name = "";
                var value = "";
                var unit = "";
                if (property.id) {
                    name = $scope.getItemPropertyName(property.id);
                }
                if (property.value) {
                    value = property.value;
                }
                if (property.unit) {
                    unit = property.unit;
                }
                diverse += name + ":" + value + " " + unit + "; ";
            });
            return diverse;
        };

        $scope.getItemPropertyName = function(propertyId) {
            if ($scope.itemPropertyMap[propertyId]) {
                $scope.itemPropertyMap[propertyId].name;
            }
        };

        $scope.qtyChange = function(form) {
            $scope.packFullIndex = -1;
            $scope.itemFullIndex = -1;

            var isComplete = true;
            angular.forEach($scope.order.itemLines, function(item, key) {
                var tol = 0;
                angular.forEach($scope.order.packages, function(pck, packIndex) {
                    tol = parseInt(tol) + parseInt(pck.packItemLines[key].qty);
                    if ($scope.packFullIndex == -1 && tol > item.qty) {
                        $scope.packFullIndex = packIndex;
                        $scope.itemFullIndex = key;
                        return;
                    }
                });
                if (tol !== item.qty) isComplete = false;

                if (key === $scope.order.itemLines.length - 1) $scope.isComplete = isComplete;
            });
        };

        $scope.complete = function() {
            packService.packOrder($scope.order.taskId, $scope.order.orderId, $scope.order.packages).then(function(response) {
                lincUtil.saveSuccessfulPopup();
                if ($scope.packOrders && index < $scope.packOrders.length) {
                    $scope.order = $scope.packOrders[$scope.index++];
                    initPck($scope.order.itemLines);
                    if (!$scope.order.packages || $scope.order.packages.length === 0) {
                        $scope.order.packages = [angular.copy(PCK)];
                        $scope.qtyChange();
                    }
                } else {
                    $state.go("wms.outbound.pack.packTaskList");
                }
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        };

        function getPackOrder(id) {

            if (isOrderId(id)) {
                packService.getPackOrderByOrderId(id).then(function(response) {
                    $scope.order = response.packOrder;

                    initPck($scope.order.itemLines);
                    if (!$scope.order.packages || $scope.order.packages.length === 0) {
                        $scope.order.packages = [angular.copy(PCK)];
                        $scope.qtyChange();
                    }

                    $scope.itemSpecMap = response.itemSpecMap;
                    $scope.itemUnitMap = response.itemUnitMap;
                });
            } else if (isLpId(id)) {
                $scope.index = 0;
                packService.getPackOrderByLp(id).then(function(response) {
                    $scope.packOrders = response.packOrders;
                    if (index < $scope.packOrders.length) {
                        $scope.order = $scope.packOrders[$scope.index++];
                        initPck($scope.order.itemLines);
                        if (!$scope.order.packages || $scope.order.packages.length === 0) {
                            $scope.order.packages = [angular.copy(PCK)];
                            $scope.qtyChange();
                        }
                    }

                    $scope.itemSpecMap = response.itemSpecMap;
                    $scope.itemUnitMap = response.itemUnitMap;
                });
            }
        }

        function initPck(items) {
            PCK.packItemLines = angular.copy(items);

        }

        $scope.printPalletLabel = function(orderId) {
            var url = $state.href('orderPalletLabelPrint', { orderId: orderId });
            window.open(url);
        };

        $scope.getItemName = function(itemSpecId) {
            if ($scope.itemSpecMap[itemSpecId]) {
                return $scope.itemSpecMap[itemSpecId].name;
            }
            return "";
        };

        $scope.getUnitName = function(unitId) {
            if ($scope.itemUnitMap[unitId]) {
                return $scope.itemUnitMap[unitId].name;
            }
            return "";
        };

        function isOrderId(id) {
            var reg = new RegExp("^" + "DN-");
            return reg.test(id);
        }

        function isLpId(id) {
            var reg = new RegExp("^" + "LP-");
            return reg.test(id);
        }


        function _init() {
            if ($stateParams && $stateParams.lpParam) {
                getPackOrder($stateParams.lpParam);
            }
        }
        _init();
    };

    controller.$inject = ['$scope', 'packService',
        'itemService', '$state', '$stateParams', 'lincUtil'
    ];
    return controller;
});
