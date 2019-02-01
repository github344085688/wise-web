'use strict';

define(['lodash'], function (_) {
    var pickRuleConfController = function ($scope, pickRuleService, itemService, organizationService, lincUtil) {

        var init = true;
        $scope.save = function () {
            if (!$scope.rule.organizationId) {
                lincUtil.errorPopup("Please Select a Customer First");
                return;
            }
            $scope.pickRule.organizationId = $scope.rule.organizationId;
            $scope.pickRule.itemSpecId = $scope.rule.itemSpecId;
            $scope.pickRule.orderedPickRules = $scope.orderedPickRules;
            $scope.loading = true;
            if ($scope.pickRule.id && $scope.pickRule.id !== null) {
                $scope.loading = false;
                pickRuleService.updatePickRule($scope.pickRule).then(function () {
                    lincUtil.saveSuccessfulPopup();
                });
            } else {
                pickRuleService.savePickRule($scope.pickRule).then(function (response) {
                    $scope.loading = false;
                    $scope.pickRule.id = response.id;
                    lincUtil.saveSuccessfulPopup();
                });
            }

        };

        $scope.getItems = function (name) {

            if (init == false) {
                if (name) {
                    if (!$scope.rule.organizationId) {
                        lincUtil.errorPopup("Please Select a Customer First");
                        return;
                    }
                }

            }
            var customerIds = [];
            customerIds.push($scope.rule.organizationId);
            var param = name ? { name: name, customerIds: customerIds } : { customerIds: customerIds };
            itemService.itemSearch(param).then(function (response) {
                $scope.items = response;
            });
            init = false;
        };

        $scope.loadNewConfig = function () {

            if (!$scope.rule.organizationId) {
                lincUtil.errorPopup("Please Select a Customer First");
                return;
            }

            $scope.getItems();
            $scope.pickRule = {};
            $scope.defaultPickRules = ["FIFO", "LP Configuration", "FILO"];
            $scope.orderedPickRules = [];
            pickRuleService.getPickRuleConfig($scope.rule).then(function (response) {
                if (response.error) {
                    lincUtil.errorPopup(response.error);
                    return;
                }
                if (response.length > 0) {
                    $scope.pickRule = response[0];
                    $scope.orderedPickRules = $scope.pickRule.orderedPickRules;
                    $scope.defaultPickRules = _.xor($scope.defaultPickRules, $scope.pickRule.orderedPickRules);
                } else {
                    $scope.orderedPickRules = [];
                }

            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });

        };

        $scope.getFieldDragListener = {
            containment: '#field-priority-container',
            dragMove: function (itemPosition, containment, eventObj) {
                eventObj.pageY -= 40;
            },
            accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
                return sourceItemHandleScope.sortableScope.$parent.$id === destSortableScope.$parent.$id;
            }
        };

        function _init() {
            $scope.rule = {};
        }

        _init();
    };

    pickRuleConfController.$inject = ['$scope', 'pickRuleService', 'itemService', 'organizationService', 'lincUtil'];

    return pickRuleConfController;
});
