'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var equipmentReportController = function($scope, $resource){

        function searchReport() {
            var equipmentReportEntry = $resource('/data/yms/equipment_report.json');
            equipmentReportEntry.get(function(response) {
                $scope.equipmentReport = response;
            });
        }

        function _init() {
            searchReport();
        }
        _init();
    };

    equipmentReportController.$inject = ['$scope', '$resource'];
    return equipmentReportController;
});