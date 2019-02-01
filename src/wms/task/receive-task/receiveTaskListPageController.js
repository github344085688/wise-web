'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, receiveTaskService, lincUtil) {
        var ctrl = this;
        ctrl.searchInfo = {};
        ctrl.pageObj = {pageSize: 10};

        ctrl.search = function() {
            ctrl.loadContent(1);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                ctrl.loadContent(1);
            }
            $event.preventDefault();
        };

        ctrl.loadContent = function (currentPage) {
            var param = angular.copy(ctrl.searchInfo);
            param.paging = { pageNo: Number(currentPage), limit: Number(ctrl.pageObj.pageSize) };
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            receiveTaskService.searchByPaging(param).then(function(response) {
                ctrl.searchReceiveTaskCompleted = true;
                ctrl.receiveTasks = response.tasks;
                ctrl.paging = response.paging;
            }, function(error) {
                lincUtil.processErrorResponse(error);
                ctrl.searchReceiveTaskCompleted = true;
            });
        };
        
        ctrl.remove = function(index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function() {
                receiveTaskService.remove(ctrl.tasks[index].id).then(function() {
                    ctrl.tasks.splice(index, 1);
                }, function(error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };
        
        function init() {
            ctrl.loadContent(1);
        }

        init();
    };
    ctrl.$inject = ['$scope', 'receiveTaskService', 'lincUtil'];
    return ctrl;
});
