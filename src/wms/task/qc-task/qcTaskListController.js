'use strict';

define(["lodash"], function (_) {
    var $scope = function ($scope, $http, qcTaskService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        $scope.search = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            $scope.loading = true;
            var param = angular.copy($scope.searchInfo);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            qcTaskService.searchQcTaskByPaging(param).then(function (response) {
                $scope.loading = false;
                $scope.qcTaskView = response.tasks;
                $scope.paging = response.paging;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.deleteQCTask = function (id) {
            lincUtil.confirmPopup("Delete QC Task", "Are you sure to delete this QC Task ?", function () {

                qcTaskService.deleteQcTask(id).then(function () {
                    $scope.search();

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/qc-task/export", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "qc.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function _init() {
            $scope.search();
        }

        _init();
    };
    $scope.$inject = ['$scope', '$http', 'qcTaskService', 'lincUtil'];
    return $scope;
});
