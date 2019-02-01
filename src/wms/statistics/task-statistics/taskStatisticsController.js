define([
    'angular',
    'lodash',
    'jquery',
    './allTaskStatisticsController'
], function (angular, _, $, allTaskStatisticsController) {
    var controller = function ($scope, $http, lincUtil, generalTaskService, pickService) {
        allTaskStatisticsController($scope, lincUtil, generalTaskService);
        //pickTaskStatisticsController($scope, $http, lincUtil, pickService);

        $scope.activetab = "AllTask";
        $scope.changeTab = function (tag) {
            $scope.activetab = tag;
        }

        $scope.viewWorkerTask = function (tasks, worker, type, event, templateId) {
            $scope.hideTemplate();
            if ($scope.selWorker === worker && $scope.selTaskType === type) {
                $scope.selTasks = null;
                $scope.selTaskType = null;
                $scope.selWorker = null;
                $scope.selTaskView = null;
                $scope.totalCount = 0;
                return;
            }
            $scope.totalCount = tasks.length;
            if (type === "progress") {
                $scope.selTasks = tasks;
            }
            if (type === "open") {
                $scope.selTasks = _.orderBy(tasks, ['lastAssignedWhen'], ['desc']);
            }
            $scope.selTaskType = type;
            $scope.selWorker = worker;
            $scope.loadContent(1);
            $(templateId).insertAfter(event.currentTarget.parentElement.parentElement);
        }

        $scope.hideTemplate = function () {
            $("#pickTaskInfo").appendTo("#template");
            $("#taskInfo").appendTo("#template");
        }

        $scope.pageSize = 10;
        $scope.totalCount = 0;
        $scope.loadContent = function (currentPage) {
            $scope.selTaskView = $scope.selTasks.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.selTasks.length ? $scope.selTasks.length : currentPage * $scope.pageSize);
        }
    };

    controller.$inject = ['$scope', '$http', 'lincUtil', 'generalTaskService', 'pickService'];
    return controller;
});