'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $http, $resource, $mdDialog, lincUtil) {
        $scope.submit = function () {
            var server = angular.copy($scope.server);
            $scope.loading = true;
            var promise;
            if ($scope.update) {
                promise = update(server);
            } else {
                promise = insert(server);
            }
            promise.then(function (data) {
                $scope.loading = false;
                var alertWindow = $mdDialog.alert()
                    .title('success')
                    .textContent('success!!!')
                    .ok('OK');

                $mdDialog.show(alertWindow);
                $scope.update = false;
                $scope.server = {};
                search({});
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function search(param) {
            $resource("/print-app/print-server/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.servers = response;
            });
        }

        function insert(fd) {
            var promise = $http.post("/print-app/print-server", fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
            return promise;
        }

        $scope.delete = function (id) {
            var confirm = $mdDialog.confirm()
                .title('Delete Printer Server!')
                .textContent('Are you sure to delete this record?')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {
                $http.delete("/print-app/print-server/" + id).then(function (response) {
                    _.remove($scope.servers, function (server) {
                        return server.id === id;
                    });
                });
            });
        };

        function update(fd) {
            var promise = $http.put("/print-app/print-server/" + $scope.server.id, fd, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });
            return promise;
        }
        $scope.activeOrInactive = function(server,status){
            server.status =status;
            $http.put("/print-app/print-server/" +server.id, server, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            }).then(function(res){
                lincUtil.updateSuccessfulPopup();
            },function(err){
                lincUtil.processErrorResponse(err);
            });
        }

        $scope.toUpdate = function (server) {
            $scope.server = angular.copy(server);
            $scope.server.port = Number($scope.server.port);
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
