'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincUtil) {
        $scope.submit = function () {
            var tfc = angular.copy($scope.tfc);
            $scope.loading = true;
            var promise;
            if (tfc.id) {
                promise = update(tfc);
            } else {
                promise = insert(tfc);
            }
            promise.then(function (data) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
                search({});
            }, function(error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function search(param) {
            $resource("/print-app/template-configure/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.tfcs = response;
            });
        }

        function insert(tfc) {
            var promise = $resource("/print-app/template-configure").save(tfc).$promise;
            return promise;
        }

        $scope.delete = function (id) {

            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                $resource("/print-app/template-configure/:id").delete({id: id}).then(function (response) {
                    _.remove($scope.tfcs, function (tfc) {
                        return tfc.id === id;
                    });
                });
            });
        };

        $scope.searchAvailableModuleTemplates = function (search) {
            var param = search === null || search === "" ? {} : {module: search};
            $resource("/print-app/module-print-template/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.availableModuleTemplates = response;
            });
        };

        $scope.reset = function () {
            $scope.tfc = {};
        };

        function update(tfc) {
            var promise = $resource("/print-app/template-configure/:id", null, {'update': {method: 'PUT'}}).update({id: tfc.id}, tfc).$promise;
            return promise;
        }

        $scope.toUpdate = function (tfc) {
            $scope.tfc = angular.copy(tfc);
            $scope.update = true;
        };

        function _init() {
            $scope.tfc = {};
            search({});
            $scope.referenceFields = ["proNo", "referenceNo", "poNo"];
            $scope.update = false;
        }

        _init();

    };
    controller.$inject = ['$scope', '$resource', 'lincUtil'];
    return controller;
});
