'use strict';

define([
    'angular',
    "lodash",
    "./batchItemPropertyController"
], function (angular, _, batchItemPropertyController) {
    var itemPageController = function ($scope, $state, $http, itemService, lincUtil, $mdDialog, fileService) {

        $scope.pageSize = 10;
        $scope.search = {};
        $scope.checkItemIds = [];
        $scope.searchItems = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            var searchParam = angular.copy($scope.search);
            if($scope.search.tags){
                searchParam.tags = [$scope.search.tags];
            }
            if ($scope.search.hasItemUpcCodeCollect) {
                searchParam.itemUpcStatuses = ["New"];
            }
            if ($scope.search.requireCollectSeasonalPack == false) {
                delete searchParam.requireCollectSeasonalPack ;
            }
            if ($scope.search.hasItemUpcCodeCollect == false) {
                delete searchParam.hasItemUpcCodeCollect ;
            }
            searchParam.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            $scope.isLoading = true;

            itemService.itemDetailInfoSearchByPaging(searchParam).then(function (response) {
                $scope.isLoading = false;
                $scope.items = response.itemSpecs;
                $scope.paging = response.paging;
            }, function (error) {
                $scope.isLoading = false;
                if (error) {
                    lincUtil.processErrorResponse(error);
                }
            });
        };
        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchItems();
            }
            $event.preventDefault();
        };
        $scope.edit = function () {
            $state.go('fd.item.itemspec.edit', { itemSpecId: $scope.selectedItemSpecId });
        };
        $scope.selectAll = false;
        $scope.checkItemIds = [];
        $scope.checkAllItems = function () {
            var currentPageItemIds = _.map($scope.items, 'id');
            if ($scope.selectAll) {
                $scope.checkItemIds = [];
                $scope.selectAll = false;
            }
            else {
                $scope.checkItemIds = currentPageItemIds;
                $scope.selectAll = true;
            }
        }
        $scope.checkItem = function (item) {
            if (_.indexOf($scope.checkItemIds, item.id) > -1) {
                _.remove($scope.checkItemIds, function (ItemId) {
                    return item.id == ItemId;
                })
            } else {
                $scope.checkItemIds.push(item.id);
            }
        }
        $scope.isChecked = function (item) {
            return _.indexOf($scope.checkItemIds, item.id) > -1;
        }
        $scope.batchItem = function () {
            if ($scope.checkItemIds.length <= 0) {
                lincUtil.errorPopup("Please select Item first");
            }
            else {
                var form = {
                    templateUrl: 'foundation-data/item/itemspec/template/batchItemProperty.html',
                    locals: {
                        checkItemIds: $scope.checkItemIds,
                    },
                    autoWrap: true,
                    controller: batchItemPropertyController
                };
                $mdDialog.show(form).then(function (response) {

                });

            }
        }

        $scope.itemSpecIdOnSelect = function (itemSpec) {
            if (itemSpec) {
                $state.go("fd.item.itemspec.edit.info", { itemSpecId: itemSpec.id });
            }
        }

        function setExcelName(itemTemplateList){
            if (!itemTemplateList[0].createdWhen) {
                var createdWhen = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
                var name = itemTemplateList[0].fileCategory + " " + createdWhen + ".xls";
                return name;
              } else {
                var name = itemTemplateList[0].fileCategory + " " + itemTemplateList[0].createdWhen + ".xls";
                return name;
               }
        }

        $scope.getDownload = function () {
            fileService.searchEntryFile({ fileCategory: 'Item',fileScenario:"Template" }).then(function (data) {
                if (data.length == 0) {
                    lincUtil.errorPopup("No available item template!"); 
                    return;
                }
                var download = "";
                var a = document.createElement('a');
                   data = _.orderBy(data, ['createdWhen'],['desc']);
                var lastedCreateTime =data[0].createdWhen;
                var itemTemplateList = _.filter(data, 'updateWhen');
                if (itemTemplateList.length === 0) {
                  a.href =fileService.buildItemDownloadUrl(data[0].fileId);
                  download = setExcelName(data);
                } else {
                    itemTemplateList =  _.orderBy(itemTemplateList, ['updateWhen'],['desc']);
                    var lastedUpdateTime = itemTemplateList[0].updateWhen;
                    if (new Date(lastedCreateTime).getTime() < new Date(lastedUpdateTime).getTime()) {
                       a.href =fileService.buildItemDownloadUrl(itemTemplateList[0].fileId);
                       download = setExcelName(itemTemplateList);
                    } else {
                       a.href =fileService.buildItemDownloadUrl(data[0].fileId);
                       download = setExcelName(data);
                    }
                }
                a.download = $scope.download = download;
                a.target = '_blank';
                a.click();
            }, function (error) {
                lincUtil.processErrorResponse(error);

            });

        };

        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;

            var searchParam = angular.copy($scope.search);
            if($scope.search.tags){
                searchParam.tags = [$scope.search.tags];
            }
            if ($scope.search.hasItemUpcCodeCollect) {
                searchParam.itemUpcStatuses = ["New"];
            }
            $scope.exporting = true;
            $http.post("/report-center/item-spec/export", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "item.xlsx");
            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            $scope.selectedItemSpecId = '';
            $scope.loadContent(1);
        }

        init();
    };

    itemPageController.$inject = ['$scope', '$state', '$http', 'itemService', 'lincUtil', '$mdDialog', 'fileService'];

    return itemPageController;
});
