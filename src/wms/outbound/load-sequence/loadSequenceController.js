'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var loadSequenceController = function($scope, loadSequenceService, $state, lincUtil, $timeout) {

        $scope.toOrderSquence = function(load) {
            $state.go('wms.outbound.sequence.orderSequence', { loadId: load.id });
        };

        $scope.save = function() {
            $scope.loading = true;
            var sequence = toLoadSequenceGroupList($scope.list);
            loadSequenceService.saveSequence($scope.truckLoadNo, sequence).then(function(){
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Receipt Error! ' + error.data.error);
            });
        };

        function getLoadById(id) {
            return $scope.loadMap[id];
        }

        function toSequenceView(loadGroups) {
            var sequenceViewList = [];
            _.forEach(loadGroups, function(load) {
                if (load.loadIds.length > 1) {
                    var group = angular.copy($scope.templates[0]);
                    _.forEach(load.loadIds, function(loadId) {
                        group.columns[0].push(getLoadById(loadId));
                    });
                    sequenceViewList.push(group);
                } else {
                    sequenceViewList.push(getLoadById(load.loadIds[0]));
                }
            });
            return sequenceViewList;
        }

        function toLoadSequenceGroupList(loadGroups) {
            var loadSequenceGroupList = [];
            _.forEach(loadGroups, function(load) {
                var loadIds = [];
                var loadSequenceGroup = {};
                if (load.columns) {
                    _.forEach(load.columns[0], function(subLoad) {
                            if (subLoad.columns) {
                                lincUtil.errorPopup("Invalid Sequence, please resequence!");
                                return;
                            }
                            loadIds.push(subLoad.id);
                        });
                } else {
                    loadIds.push(load.id);
                }
                loadSequenceGroup.loadIds = loadIds;
                loadSequenceGroupList.push(loadSequenceGroup);
            });
            return loadSequenceGroupList;
        }


        /**
         *  Drop to only remove group
         */
        $scope.dropCallback = function(event, index, item, external) {
            if (item.type) {
                $timeout(function function_name(argument) {
                    var i = $scope.index;
                    _.forEach(item.columns[0], function(value) {
                        $scope.$apply(function() {
                            $scope.movedList.splice(i++, 0, value);
                        });
                    });
                }, 100);
                return true;
            }
            return false;
        };

        // Drag to mark the position of the item
        $scope.dndMovedCallBack = function(list, index) {
            $scope.index = index;
            // console.log("$scope.index" + index);
            list.splice(index, 1);
            $scope.movedList = list;
        };

        $scope.searchSequenceByLoad = function() {
            if ($scope.loadNo) {
                loadSequenceService.getSequenceByLoadNo($scope.loadNo).then(function(response) {
                    if (response.error) {
                        lincUtil.errorPopup(response.error);
                        return;
                    }
                    if (response.sequence.length === 0) {
                        lincUtil.errorPopup("Please build truckLoad first!!");
                        return;
                    }
                   
                    $scope.sequence = response.sequence;
                    $scope.loadMap = response.loadMap;
                    $scope.truckLoadNo = response.truckLoadNo;
                    $scope.list = toSequenceView($scope.sequence);

                });
            }
        };

        $scope.delete = function(key) {
            //delete key
            lincUtil.deleteConfirmPopup("Are you sure to delete the sequence?", function() {
                $scope.list = [];
                $scope.message = "order sequence has been deleted successfully, message would be removed in 3 seconds";
                $timeout(function() { $scope.message = ""; }, 3000);
            });
        };

        function _init() {
            $scope.templates = [{
                type: "Group",
                columns: [
                    []
                ]
            }];
            $scope.tips = "Please drag to prioritise, loads in group means in the same priority";
            $scope.list = [];
            // searchSequence();
        }

        _init();
    };

    loadSequenceController.$inject = ['$scope', 'loadSequenceService', '$state', 'lincUtil', '$timeout'];
    return loadSequenceController;
});
