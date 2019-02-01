'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var uploadController = function ($scope, $stateParamslincUtil, locals, $mdDialog, orderService, fileService) {
        var order = locals.order;
        $scope.pageSize = 10;
        $scope.uploadFileSuccess = function (param) {
            var fileIds = param.fileId;
            if (fileIds) {
                order.fileIds = _.union(order.fileIds, fileIds)
                updateOrder(order);
            }

        }

        function updateOrder(order) {

            orderService.updateOrder(order.id, order).then(function () {
                getOrder(order.id);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadFile = function (file) {
            var a = document.createElement('a');
            var fileDownloadUrl = fileService.buildDownloadUrl(file.id);
            a.href = fileDownloadUrl;
            a.download = file.name;
            a.target = '_blank';
            a.click();
        }

        function getOrder(orderId) {

            orderService.getOrder(orderId).then(function (order) {
                var fileIds = _.size(order.fileIds) > 0 ? order.fileIds : [];
                if (fileIds.length > 0) {
                    fileService.fileSearch({
                        ids: fileIds
                    }).then(function (files) {
                        $scope.orderFiles = files;
                        $scope.loadContent(1);
                    });
                }else{
                    $scope.orderFiles = [];
                    $scope.loadContent(1);
                }

            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.orderFilesView = $scope.orderFiles.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orderFiles.length ? $scope.orderFiles.length : currentPage * $scope.pageSize);
        };

        function _init() {

            getOrder(order.id);
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        _init();

        $scope.deleteFileEntry = function (fileId) {

           _.remove(order.fileIds, function (id) {
                return id == fileId;
            });
            updateOrder(order);
        }
    }
    uploadController.$inject = ['$scope', 'lincUtil', 'locals', '$mdDialog', 'orderService', 'fileService'];

    return uploadController;
});