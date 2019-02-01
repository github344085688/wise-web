'use strict';

define(['./directives', 'angular', 'lodash'], function (directives, angular, _ ) {
    directives.directive('updateStepAssignees', ['$parse', '$mdMedia', '$mdDialog',
        function ($parse, $mdMedia, $mdDialog) {
            return {
                restrict: "A",
                scope: {
                    taskStep: '=',
                    isUnis: '@'
                },
                link: function (scope, elem, attrs) {
                    elem.bind('click', function (event) {
                        popupDialog(event);
                    });
                    function popupDialog(ev) {
                        var templateUrl;
                        if(scope.isUnis) {
                            templateUrl = "common/directive/template/unisUpdateStepAssignees.html"
                        }else {
                            templateUrl = "common/directive/template/updateStepAssignees.html"
                        }
                        $mdDialog.show({
                            controller: 'updateStepAssigneesController',
                            templateUrl: templateUrl,
                            clickOutsideToClose: true,
                            locals: {
                                step: scope.taskStep
                            }
                        }).then(function (data) {
                            scope.taskStep = data;
                        });
                    }
                }
            };
        }])

        .controller('updateStepAssigneesController', ['$scope', 'generalStepService', 'step', '$mdDialog',
            function ($scope, generalStepService, step, $mdDialog) {
                $scope.formTitle = "Update Step Assignee";
                var assignees= [];
                $scope.save = function () {
                    var saveStep = angular.copy($scope.step);
                    $scope.errorMsg = "";
                    $scope.loading = true;
                    generalStepService.updateStep(saveStep).then(function (response) {
                        $scope.loading = false;
                        saveStep.assignees = assignees;
                        $mdDialog.hide(saveStep);
                    }, function (error) {
                        $scope.errorMsg = error.message;
                        $scope.loading = false;
                    });
                };

                $scope.onSelectUser = function (users) {
                    assignees = users;
                };
                
                $scope.onRemoveUser = function (users) {
                    assignees = users;
                }

                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                function _init() {
                    $scope.step = angular.copy(step);
                }

                _init();
            }]);

});
