'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var statusReportController = function($scope, $resource) {

        function searchReport() {
            var statusReportEntry = $resource('/data/yms/status_report.json');
            statusReportEntry.get(function(response) {
                $scope.statusReport = response;
            });
        }

        function _init() {
            searchReport();
        }
        _init();
    };

    statusReportController.$inject = ['$scope', '$resource'];
    return statusReportController;
});
