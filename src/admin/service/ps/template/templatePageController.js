'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $http, $resource, $window, lincUtil) {

        $scope.submit = function () {
            var fd = getData();
            $scope.loading = true;
            var promise;
            if ($scope.update) {
                promise = update(fd);
            } else {
                promise = insert(fd);
            }

            promise.then(function (data) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $scope.update = false;
                    $scope.template = {};
                    search({});
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });

        };

        function getData() {
            var fd = new FormData();
            if ($scope.template.id) {
                fd.append("id", $scope.template.id);
            }
            fd.append("name", $scope.template.name);
            fd.append("templateFile", $scope.template.templateFile);
            fd.append("sampleFile", $scope.template.sampleFile);
            fd.append("paperSize", $scope.template.paperSize);
            fd.append("description", $scope.template.description);
            return fd;
        }

        function search(param) {
            $resource("/print-app/template/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.templates = response;
            });
        }

        function insert(fd) {
            var promise = $http.post("/print-app/template", fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            });
            return promise;
        }

        $scope.delete = function (id) {

            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                $http.delete("/print-app/template/" + id).then(function (response) {
                    _.remove($scope.templates, function (template) {
                        return template.id === id;
                    });
                });
            });
        };

        function update(fd) {
            var promise = $http.post("/print-app/template/" + $scope.id, fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            });
            return promise;
        }

        $scope.toUpdate = function (template) {
            $scope.template = template;
            $scope.update = true;
        };

        $scope.templateFileChange = function (element) {
            $scope.$apply(function () {
                $scope.templateFilePath = element.value;
                $scope.template.templateFile = element.files[0];

            });
        };

        $scope.sampleFileChange = function (element) {
            $scope.$apply(function () {
                $scope.sampleFilePath = element.value;
                $scope.template.sampleFile = element.files[0];
            });
        };

        function _init() {
            search({});
            $scope.template = {};
            $scope.update = false;
        }

        _init();

    };
    controller.$inject = ['$scope', '$http', '$resource', '$window', 'lincUtil'];
    return controller;
});
