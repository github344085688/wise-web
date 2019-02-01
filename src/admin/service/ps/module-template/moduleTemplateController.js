'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincUtil) {
        $scope.submit = function () {
            var mt = angular.copy($scope.mt);
            $scope.loading = true;
            var promise;
            if (mt.id) {
                promise = update(mt);
            } else {
                promise = insert(mt);
            }
            promise.then(function (data) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
                search({});
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function search(param) {
            $resource("/print-app/module-print-template/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.mts = response;
            });
        }

        function insert(mt) {
            var promise = $resource("/print-app/module-print-template").save(mt).$promise;
            return promise;
        }

        $scope.delete = function (id) {

            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                $resource("/print-app/module-print-template/:id").delete({id: id}).then(function (response) {
                    _.remove($scope.mts, function (mt) {
                        return mt.id === id;
                    });
                });
            });
        };

        $scope.reset = function () {
            $scope.mt = {};
        };

        function update(mt) {
            var promise = $resource("/print-app/module-print-template/:id", null, {'update': {method: 'PUT'}}).update({id: mt.id}, mt).$promise;
            return promise;
        }

        $scope.toUpdate = function (mt) {
            $scope.mt = angular.copy(mt);
            $scope.update = true;
        };

        function _init() {
            $scope.mt = {};
            search({});
            $scope.modules = ['Packing_List', 'UCC_AAFE', 'UCC_AMAZON', 'UCC_TARGET', 'UCC_BESTBUY', 'PALLET_LABEL', 'ENTRY_LABEL', "ITEM_SPEC_LABEL", "LP_BARCODE", "ILP_LP_BARCODE", "CLP_LP_BARCODE", "SLP_LP_BARCODE", "TRANSLOAD_ILP_LP_BARCODE", "TRANSLOAD_CLP_LP_BARCODE", "TRANSLOAD_SLP_LP_BARCODE", "ITEM_UPC_LABEL", "EQUIPMENT_BARCODE", "EQUIPMENT_ID_LABEL"];
            $scope.update = false;
        }

        _init();

    };
    controller.$inject = ['$scope', '$resource', 'lincUtil'];
    return controller;
});
