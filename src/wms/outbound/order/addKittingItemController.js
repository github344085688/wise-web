'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, itemService, $mdDialog, customerId) {
        initSet();
        var kittingItems = [];
        $scope.isSave=true;
        $scope.titleId=null;
        $scope.supplierId=null;
        $scope.kittingItemName=null;
        $scope.iskidItem=false;
        function initSet() {
            $scope.customerId = customerId;
        }

        $scope.itemSpecIdOnSelect = function (item) {
            $scope.kittingItemName=item.name;
            itemService.searchKittingItems({itemSpecId: item.id}).then(function (items) {
                if (items.length > 0) {
                    $scope.iskidItem=false;
                    kittingItems = items;
                    $scope.isSave=false;

                }else {
                    $scope.iskidItem=true;
                }
                $scope.isloadingkidItems=false;
            }, function (error) {
                $scope.iskidItem=true;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.titleOnSelect = function (selectObj) {
            if (selectObj) {
                $scope.titleName = selectObj.name;
            }
        };

        $scope.submit = function () {
            _.forEach(kittingItems, function (value, key) {
                if (!value.unit) {
                    value.unit = value.ItemUnit;
                }
                 value.titleId= $scope.titleId;
                 value.titleName= $scope.titleName;
                 value.supplierId= $scope.supplierId;
                 value.qty = value.qty * $scope.itemqty;
                 value.palletQty=$scope.palletQty;
                 value.adjustedPalletQty=$scope.adjustedPalletQty;
                 value.orderWeight=$scope.orderWeight;
                 value.lpConfigurationId=$scope.lpConfigurationId;
                 value.lotNo=$scope.lotNo;
            });
            $mdDialog.hide(kittingItems);
        };


    };
    controller.$inject = ['$scope', '$resource', 'itemService', '$mdDialog', 'customerId'];
    return controller;
});