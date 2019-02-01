'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, locationService, lincUtil, taskTemplateService,facilityService) {

        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.taskTypes = ["Receive", "Pick", "Pack", "Load", "Put Away", "Generic", "Configuration Change"];
        $scope.StepTypes = ["Predefined", "Offload", "Pallet Count", "LP Setup", "LP Verify", "SN Scan", "Load", "Count Unshipped", "Put Away", "PICK", "Pack", "STAGE", "Generic", "CC Efficiency to Pool", "CC Efficiency Pool to LP", "CC Traditional", "Replenishment"];

        SearchTaskTemplate({});
        searchFacility();
        $scope.search = function () {
            $scope.searchTaskTemplateCompleted = false;
            SearchTaskTemplate($scope.searchInfo);

        };

        function SearchTaskTemplate(param) {
            taskTemplateService.searchTaskTemplateGroupFromBam(param).then(function (data) {
                $scope.taskTemplates = data.taskTemplates;
                $scope.loadContent(1);
                $scope.searchTaskTemplateCompleted = true;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.loadContent = function (currentPage) {

            $scope.taskTemplateView = $scope.taskTemplates.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.taskTemplates.length ? $scope.taskTemplates.length : currentPage * $scope.pageSize);
        };

        $scope.remove = function (taskTemplate) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                taskTemplateService.deleteTaskTemplate(taskTemplate.id).then(function () {
                    lincUtil.saveSuccessfulPopup(function () {
                        SearchTaskTemplate({});
                    });

                }, function (Error) {
                    lincUtil.processErrorResponse(error);
                });

            });
        };

        function searchFacility() {
                facilityService.searchFacility({}).then(function (response) {
                     $scope.facilities=response;
                    $scope.facilitiesMap =_.keyBy(response,'id');
                }, function () { });
            }


    };
    controller.$inject = ['$scope', '$mdDialog', 'locationService', 'lincUtil', 'taskTemplateService','facilityService'];
    return controller;
});
