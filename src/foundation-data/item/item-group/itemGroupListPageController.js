'use strict';

define(['lodash'], function(_) {
    var ctrl = function($scope, itemPropertyService, $state, lincUtil) {
        var ctrl = this;
        ctrl.pageSize = 8;

        itemPropertyService.getItemPropertyGroups({}).then(function(data) {
            ctrl.totalItemPropertyGroups = data.totalItemPropertyGroups;
            ctrl.groupsIsUsedMap = getGroupsIsUsedMap(data.itemPropertyGroupMap);
            processDataView(1);
            ctrl.searchItempPropertyGroupCompleted = true;
        });

        function getGroupsIsUsedMap(itemPropertyGroupMap) {
            var groupIsUsedMap = {};
            _.forEach(itemPropertyGroupMap, function (items, key) {
                groupIsUsedMap[key] = items.length > 0 ? true : false;
            });
            return groupIsUsedMap;
        }

        function initProperties() {
            _.forEach(ctrl.totalItemPropertyGroups, function(ipg) {
                itemPropertyService.getItemPropertiesByGroupId(ipg.id).then(function(data) {
                    ipg.properties = data;
                    itemPropertyService.idToProperties(ipg.properties);
                });
                itemPropertyService.idToProperties(ipg.parentGroupProperties);
                
            });
        }

        function processDataView(currentPage) {
            initProperties();
            var startPosition = (currentPage - 1) * ctrl.pageSize;
            ctrl.itemPropertyGroups = _.slice(ctrl.totalItemPropertyGroups, startPosition, startPosition + ctrl.pageSize);
        }

        ctrl.search = function() {
            ctrl.searchItempPropertyGroupCompleted = false;
            ctrl.itemPropertyGroups = itemPropertyService.getItemGroups({
                name: $scope.groupName
            }).then(function(data) {
                ctrl.totalItemPropertyGroups = data;
                processDataView(1);
                ctrl.searchItempPropertyGroupCompleted = true;
            }, function() {});

        };

        ctrl.loadContent = function(currentPage) {
            processDataView(currentPage);
        };

        ctrl.editItemPropertyGroup = function(groupId) {
            $state.go('fd.item.itemGroup.edit', { itemGroupId: groupId });
        };

        ctrl.removeItemPropertyGroup = function(index) {
            lincUtil.deleteConfirmPopup("Would like to delete this record?", function() {
                itemPropertyService.removeGroupById(ctrl.itemPropertyGroups[index].id).then(function() {
                    ctrl.itemPropertyGroups.splice(index, 1);
                    // success
                }, function(error) {
                    lincUtil.errorPopup("Delete Failed." + error.data.error);
                });
            });
        };
    };
    ctrl.$inject = ['$scope', 'itemPropertyService', '$state', 'lincUtil'];
    return ctrl;
});
