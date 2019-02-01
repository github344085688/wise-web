'use strict';

define(['lodash', 'angular'], function (_,  angular) {
    var controller = function ($scope, blackSNService, itemService, lincUtil) {

        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};
        var checkedIds = [];
        var currentPageIndex;

        $scope.searchItemBlack = function() {
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

        $scope.clickAllChecked = function () {
            var items = $scope.itemBlackLists;
            if (!items || items.length == 0) return;
            if ($scope.isAllChecked()) {
                checkedIds = [];
            } else {
                checkedIds = _.map(items, "id");
            }
        };

        $scope.isAllChecked = function () {
            var items = $scope.itemBlackLists;
            if (!items || items.length == 0) return;
            if (!checkedIds || checkedIds.length == 0) return false;
            if (checkedIds.length === items.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isChecked = function (blackId) {
            var index = _.indexOf(checkedIds, blackId);
            return index > -1;
        };

        $scope.clickItem = function (blackId) {
            var index = _.indexOf(checkedIds, blackId);
            if (index > -1) {
                checkedIds.splice(index, 1);
            } else {
                if(!checkedIds) {
                    checkedIds = [];
                }
                checkedIds.push(blackId);
            }
        };

        $scope.loadContent = function (currentPage) {
            currentPageIndex = currentPage;
            var param = angular.copy($scope.searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.isLoading = true;
            blackSNService.searchItemBlackByPaging(param).then(function(response) {
                $scope.isLoading = false;
                $scope.itemBlackLists = response.itemBlackLists;
                $scope.paging = response.paging;
                checkedIds = [];
            }, function(error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.batchDelete = function () {
            if(checkedIds.length < 1) {
                lincUtil.messagePopup("Tip", "Please choose one item black to delete at least.");
                return;
            }
            $scope.isBatchDelete = true;
            lincUtil.deleteConfirmPopup('Would you like to batch remove these item blacks?', function () {
                blackSNService.batchDelete(checkedIds).then(function () {
                    $scope.isBatchDelete = false;
                    $scope.loadContent(currentPageIndex);
                }, function (error) {
                    $scope.isBatchDelete = false;
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };


        function init() {
            $scope.loadContent(1);
        }

        init();
    };
    controller.$inject = ['$scope', 'blackSNService', 'itemService', 'lincUtil'];
    return controller;
});
