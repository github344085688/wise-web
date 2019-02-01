
define(['angular','lodash', 'jquery'], function (angular, _, $) {
    var controller = function ($scope, lincUtil, generalTaskService) {

        var sortMap = {};
        $scope.sortClick = function (key) {
            var sort = "asc";
            if (sortMap[key]) sort = sortMap[key];

            if (sort === "asc") sort = "desc";
            else sort = "asc";
            sortMap[key] = sort;

            $scope.taskData.workerList = _.orderBy($scope.taskData.workerList, [key], [sort]);
            $scope.hideTemplate();
        };

        $scope.selectLine = function (tasks, worker, type, event) {
            $scope.viewWorkerTask(tasks, worker, type, event, "#taskInfo");
        };

        $scope.filterTask = function (type) {
            $scope.hideTemplate();
            $scope.taskData = angular.copy(allTaskData);
            if (type === "all") return;

            _.forEach($scope.taskData.workerList, function (worker) {
                var progressTasks = [];
                _.forEach(worker.progressTasks, function(task) {
                    if (task.taskType === type) {
                        progressTasks.push(task);
                    }
                })
                worker.progressTasks = progressTasks;
                worker.progressTaskCount = progressTasks.length;

                var openTasks = [];
                _.forEach(worker.openTasks, function(task){
                    if (task.taskType === type) {
                        openTasks.push(task);
                    }
                })
                worker.openTasks = openTasks;
                worker.openTaskCount = openTasks.length;
                worker.taskCount = worker.progressTaskCount + worker.openTaskCount;
            });
        }

        var allTaskData = {};
        $scope.taskData = {};
        function init() {
            $scope.isLoading = true;
            generalTaskService.getTaskReport().then(function (data) {
                $scope.isLoading = false;
                allTaskData = data;
                $scope.taskData = data;

            }, function (error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }
        init();
    };

    return controller;
});