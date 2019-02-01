'use strict';

define([
    'angular',
    './factories'
], function(angular,factories) {
    factories.factory('jiraService', function($http) {
        var service = {};
        service.createIssue = function(param) {
            return $http.post("/jira/rest/api/2/issue",
                param, {headers:{
                    'Content-Type': "application/json",
                    'Authorization': "Basic ZWFzb25jOmVhc29uMjAxNw==",
                    'X-Atlassian-Token': "no-check"}});
        };
        service.addAttachments = function(param, issueKey) {
            return $http.post("/jira/rest/api/2/issue/" + issueKey + "/attachments",
                param, {
                    // transformRequest: angular.identity,
                    headers:{
                    'Content-Type': undefined,
                    'Authorization': "Basic ZWFzb25jOmVhc29uMjAxNw==",
                    'X-Atlassian-Token': "no-check"}});
        };
        return service;
    });
});
