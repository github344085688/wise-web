'use strict';

define(['angular','lodash'], function (angular,_) {
    var controller = function ($scope, $http, lincUtil, pickService) {

        $scope.export = function () {
            if (!$scope.taskData || !$scope.taskData.pickerList || $scope.taskData.pickerList.length === 0) {
                lincUtil.errorPopup("Not data export");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            var param = {};
            param.data = $scope.taskData.pickerList;
            param.head = ["picker", "isOnline", "progressTaskCount", "progressTaskItemLine", "openTaskCount", "openTaskItemLine"];

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "pickTasksStatistics.xlsx");

            }, function (error) {
                $scope.exporting = false;
                lincUtil.errorPopup(error);
            });
        };

        var sortMap = {};
        $scope.sortClick = function (key) {
            var sort = "asc";
            if (sortMap[key]) sort = sortMap[key];

            if (sort === "asc") sort = "desc";
            else sort = "asc";
            sortMap[key] = sort;

            $scope.taskData.pickerList = _.orderBy($scope.taskData.pickerList, [key], [sort]);
        };

        $scope.createRange = function(number) {
            return _.range(1, number);
        };

        $scope.showNoTaskUser = false;
        $scope.showTaskUser = function () {
            $scope.showNoTaskUser = !$scope.showNoTaskUser;
        };

        $scope.taskData = {};
        function init() {
            $scope.isLoading = true;
            pickService.getPickTaskReport().then(function (data) {
                $scope.isLoading = false;
                $scope.taskData = data;
                $scope.maxOpenTaskCountForPicker = _.maxBy($scope.taskData.pickerList,"openTaskCount").openTaskCount;
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }
        init();
    };

    controller.$inject = ['$scope', '$http', 'lincUtil', 'pickService'];
    return controller;
});