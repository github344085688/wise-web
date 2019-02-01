'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, transloadTaskService, lincUtil) {
        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};

        $scope.search = function() {
            $scope.loadContent(1);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        };

        $scope.remove = function(index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function() {
                transloadTaskService.remove($scope.tasks[index].id).then(function() {
                    $scope.tasks.splice(index, 1);
                }, function(error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searchTaskCompleted = false;
            transloadTaskService.searchTransloadTaskDetailByPaging(param).then(function(response) {
                $scope.searchTaskCompleted = true;
                $scope.tasks = response.tasks;
                $scope.orderMapByload=response.orderMapByload;
                $scope.dockMapByEntry=response.dockMapByEntry;
                $scope.paging = response.paging;
            }, function(error) {
                lincUtil.processErrorResponse(error);
                $scope.searchTaskCompleted = true;
            });
        };


        function init() {
            $scope.loadContent(1);
        }

        init();

    };
    ctrl.$inject = ['$scope', 'transloadTaskService', 'lincUtil'];
    return ctrl;
});
