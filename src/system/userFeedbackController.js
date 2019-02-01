'use strict';

define(['angular', 'lodash'], function(angular, _ ) {
    var controller = function($scope, facilityService, lincUtil, jiraService, $document) {
        $scope.submitLabel = "Submit";
        var upload_file;
        function getFacilities() {
            facilityService.searchFacility({}).then(function (response) {
                $scope.facilities = lincUtil.extractOrganizationBasicField(response);
            });
        }

        function _init() {
            getFacilities();
            $scope.feedback = {};
           
        }

        $scope.submitFeedback = function () {
            var postData = organizationSubmitData(angular.copy($scope.feedback));
            $scope.loading = true;
            jiraService.createIssue(postData).then(function (response) {
               if(upload_file) {
                    uploadFile(upload_file, response.data.key);
                }
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Fail! ' + error.error);
            });
        }

        $scope.upLoadFileChange = function (element) {
            upload_file = element[0].files[0];
        };

        function uploadFile(file, issueKey) {
            var formData = new FormData();
            formData.append("file", file);
            jiraService.addAttachments(formData, issueKey).then(function (response) {
                
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Fail! ' + error.error);
            });
        }
        
        function organizationSubmitData(feedback) {
            return {
                fields: {
                    project:
                    {
                        id: "10500"
                    },
                    summary: feedback.subject,
                    description: organizationDescription(feedback),
                    issuetype: {"id": "3"}
                }
            }
        }
        
        function organizationDescription(feedback) {
            return feedback.comments + "\n" + "\n" + "\n" + "\n" + "\n" +
                "First Name: " + (feedback.firstName? feedback.firstName : "")  + "\n" +
                "Last Name: " + (feedback.lastName? feedback.lastName : "") + "\n" +
                "Facility Name: " + (feedback.facility? feedback.facility.name : "") + "\n" +
                "Department: " + (feedback.department? feedback.department : "") + "\n" +
                "Email: " + (feedback.email? feedback.email : "") + "\n" +
                "System: " + (feedback.system? feedback.system : "");
        }
        _init();
    };

    controller.$inject = ['$scope','facilityService', 'lincUtil', 'jiraService', '$document'];

    return controller;
});
