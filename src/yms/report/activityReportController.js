'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var activityReportController = function($scope, $resource){

        function searchReport() {
            var activityReportEntry = $resource('/data/yms/activity_report.json');
            activityReportEntry.get(function(response) {
                $scope.activityReport = response;
            });
        }

        function _init() {
            searchReport();
        }
        _init();
    };

    activityReportController.$inject = ['$scope', '$resource'];
    return activityReportController;
});