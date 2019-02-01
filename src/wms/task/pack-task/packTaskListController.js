'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var packTaskListController = function($scope, packService, orderService, $state, $stateParams, lincUtil) {
        $scope.pageObj = {pageSize: 10};
        $scope.search = {};

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.search);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searching = true;
            packService.searchTasksByPaging(param).then(function(response) {
                $scope.searching = false;
                $scope.tasks = response.result.tasks;
                $scope.paging = response.result.paging;
                $scope.idmUserMap = response.idmUserMap;
                $scope.itemSpecMap = response.itemSpecMap;
                $scope.itemUnitMap = response.itemUnitMap;
            },function () {
                $scope.searching = false;
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                packService.deleteTask(taskId).then(function (){
                    removeTaskFromArrByTaskId($scope.tasks,taskId);
                    removeTaskFromArrByTaskId($scope.pageTasks,taskId);
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        function removeTaskFromArrByTaskId(arr, taskId) {
            var index = _.findIndex(arr, function(task) { return task.id == taskId;});
            if(index > -1) {
                arr.splice(index, 1);
            }
        }
        
        $scope.searchOLToPack = function(id) {
            if (isOrderId(id)) {
                orderService.getOrder(id).then(function(order) {
                    if (order.status === "Packed") {
                        $state.go("wms.outbound.pack.packOrderDetail", { lpParam: id });
                    } else {
                        $state.go("wms.outbound.pack.packOrder", { lpParam: id });
                    }
                }, function(error) {
                    lincUtil.processErrorResponse(error);
                });
            } else if (isLPId(id)) {
                $state.go("wms.outbound.pack.packOrder", { lpParam: id });
            } else {
                lincUtil.messagePopup("Input Validation", "Please input an valid orderId or LPId")
            }
        };

        function isLPId(id) {
            var reg = new RegExp("^" + "LP-");
            return reg.test(id);
        }

        function isOrderId(id) {
            var reg = new RegExp("^" + "DN-");
            return reg.test(id);
        }

        $scope.searchTasks = function() {
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

        function _init() {
            $scope.loadContent(1);
        }
        _init();
    };

    packTaskListController.$inject = ['$scope', 'packService', 'orderService', '$state', '$stateParams', 'lincUtil'];
    return packTaskListController;
});
