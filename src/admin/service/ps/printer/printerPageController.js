'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $http, $resource, $mdDialog, lincUtil) {
        $scope.submit = function () {
            var printer = angular.copy($scope.printer);
            if(printer.printerName.indexOf(" ")>-1){
                lincUtil.errorPopup('The Printer name can not contain space.');
                return;
            }

            $scope.loading = true;
            var promise;
            if (printer.id) {
                promise = update(printer);
            } else {
                promise = insert(printer);
            }
            promise.then(function (data) {
                $scope.loading = false;
                var alertWindow = $mdDialog.alert()
                    .title('success')
                    .textContent('success!!!')
                    .ok('OK');

                $mdDialog.show(alertWindow);
                $scope.update = false;
                $scope.printer = {};
                search({});
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function search(param) {
            $resource("/print-app/printer/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.printers = response;
            });
        }

        function insert(printer) {
            var promise = $http.post("/print-app/printer", printer, {
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            });
            return promise;
        }

        $scope.delete = function (id) {

            var confirm = $mdDialog.confirm()
                .title('Delete Printer!')
                .textContent('Are you sure to delete this record?')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                $http.delete("/print-app/printer/" + id).then(function (response) {
                    _.remove($scope.printers, function (printer) {
                        return printer.id === id;
                    });
                });
            });

        };

        function update(printer) {
            var promise = $http.put("/print-app/printer/" + printer.id, printer, {
                withCredentials: true,
                headers: {'Content-Type': 'application/json'}
            });
            return promise;
        }

        $scope.toUpdate = function (printer) {
            $scope.printer = angular.copy(printer);
            $scope.update = true;
        };

        function _init() {
            search({});
            $scope.update = false;
        }

        _init();

    };
    controller.$inject = ['$scope', '$http', '$resource', '$mdDialog', 'lincUtil'];
    return controller;
});
