'use strict';

define(['lodash'], function (_) {
    var controller = function ($scope, itemPropertyService, lincUtil) {
      
        $scope.itemProperty = {};
        $scope.pageSize = 10;

        $scope.search = function () {
            searchProperties($scope.itemProperty);
        }

        function searchProperties(searchParam) {
            $scope.searchItempPropertyCompleted = false;
            itemPropertyService.getProperties(searchParam).then(function (data) {
                $scope.searchItempPropertyCompleted = true;
                $scope.itemProperties = data.itemProperties;
                $scope.propertyIsUsedMap = getPropertyIsUsedMap(data.itemPropertyMap);
                $scope.loadContent(1);
            }, function () {
                $scope.searchItempPropertyCompleted = true;
            });
        }

        function getPropertyIsUsedMap(itemPropertyMap) {
            var propertyIsUsedMap = {};
            _.forEach(itemPropertyMap, function (items, key) {
                propertyIsUsedMap[key] = items.length > 0 ? true : false;
            });
            return propertyIsUsedMap;
        }

        $scope.loadContent = function (currentPage) {
            $scope.itemPropertiesView = $scope.itemProperties.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.itemProperties.length ?
                    $scope.itemProperties.length : currentPage * $scope.pageSize);
        };

        $scope.removeItemProperty = function (index) {
            lincUtil.deleteConfirmPopup("Would like to delete this record?", function () {
                itemPropertyService.removeById($scope.itemProperties[index].id).then(function () {
                    $scope.itemProperties.splice(index, 1);
                }, function (error) {
                    lincUtil.errorPopup("Delete Failed." + error.data.error);
                });
            });
        };

        function _init() {
            searchProperties($scope.itemProperty);
        }

        _init();
    };
    controller.$inject = ['$scope', 'itemPropertyService', 'lincUtil'];
    return controller;
});
