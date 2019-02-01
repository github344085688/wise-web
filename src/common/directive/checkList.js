/**
 * Created by Giroux on 2016/10/25.
 */

'use strict';

define(['jquery', 'lodash', './directives'], function($, _, directives) {
    directives.directive('checkList', ["$document", function($document) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/checkList.html',

            scope: {
                ngModel: '=',
                onSelect:'&'
            },
            link: function($scope, element) {
                $scope.isCheckListOpen = false;
                $scope.checkListOpen = function () {
                    if ($scope.ngModel.data.length == 0) {
                        return;
                    }
                    $scope.isCheckListOpen = true;
                }

                $scope.isCheckAll = false;
                $scope.checkAll = function () {
                    if ($scope.isCheckAll) {
                        $scope.isCheckAll = false;
                        $scope.ngModel.sel = [];
                    } else {
                        $scope.ngModel.sel = [];
                        if ($scope.ngModel.data.length == 0) {
                            $("#selAll").removeAttr("checked");
                            return;
                        }
                        _.forEach($scope.ngModel.data, function (lp) {
                            $scope.ngModel.sel.push(lp.id);
                        })
                        $scope.isCheckAll = true;
                    }
                    if($scope.onSelect) {
                        $scope.onSelect();
                    }
                }

                $scope.isChecked = function (id) {
                    var sel = _.find($scope.ngModel.sel, function(lp) {
                        return lp == id;
                    });
                    if (sel == null) return false;
                    return true;
                }

                $scope.checkOrUnCheck = function (id) {
                    if (_.findIndex($scope.ngModel.sel, function(checkId) { return checkId == id; }) > -1) {
                        _.remove($scope.ngModel.sel, function(checkId) {
                            return checkId == id;
                        });
                    } else {
                        $scope.ngModel.sel.push(id);
                    }
                    if($scope.onSelect) {
                        $scope.onSelect();
                    }
                    $scope.clickTriggeredSelect = true;
                }

                $scope.getLPList = function(pgNo) {
                    pgNo = pgNo || 1;
                    var lpGroup = _.chunk($scope.ngModel.data, 10);

                    pgNo = pgNo > lpGroup.length ? lpGroup.length : pgNo;
                    return lpGroup[pgNo-1];
                };

                //====================

                $scope.$watch("ngModel", function(){
                    $scope.isCheckAll = false;
                    $("#selAll").removeAttr("checked");
                });

                function hideSelectDownPanelOnDocumentClick(e) {
                    if (!$scope.isCheckListOpen) return;

                    var contains = false;
                    if (window.jQuery) {
                        contains = window.jQuery.contains(element[0], e.target);
                    } else {
                        contains = element[0].contains(e.target);
                    }

                    if (!contains && !$scope.clickTriggeredSelect) {
                        $scope.$apply(function () {
                            $scope.isCheckListOpen = false;
                        })
                    }

                    $scope.clickTriggeredSelect = false;
                }
                $document.on('click', hideSelectDownPanelOnDocumentClick);

                function init() {
                    if ($scope.ngModel == null) {
                        $scope.ngModel = {};
                    }
                    if ($scope.ngModel.data == null) {
                        $scope.ngModel.data = [];
                    }
                    if ($scope.ngModel.sel == null) {
                        $scope.ngModel.sel = [];
                    }
                }
                init();

            }
        };
    }]);
});
