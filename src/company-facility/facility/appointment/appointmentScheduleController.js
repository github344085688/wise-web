'use strict';

define([
    'angular',
    'lodash',
    'moment'
], function(angular, _, moment) {
    var controller = function ($scope, lincUtil, appointmentService) {
        $scope.search = {};
        $scope.pageObj = {pageSize: 10};

        var columnDefs = [
            { headerName: "Customer", field: "customerName"}
        ];

        $scope.searchAppointmentStatistic = function () {
            var searchParam = angular.copy($scope.search);
            var fromDate = moment(searchParam.appointmentTimeFrom, 'YYYY-MM-DD');
            var toDate = moment(searchParam.appointmentTimeTo, 'YYYY-MM-DD');
            if(!fromDate.isValid() && !toDate.isValid()) {
                setColumnDefsAndSearchParam(moment().subtract(6, 'days'), 6, searchParam);
            }else if(!fromDate.isValid()) {
                setColumnDefsAndSearchParam(angular.copy(toDate).subtract(6, 'days'), 6, searchParam);
            }else if(!toDate.isValid()) {
                setColumnDefsAndSearchParam(fromDate, 6, searchParam);
            }else {
                var diff = toDate.diff(fromDate, 'days');
                if (diff >= 0 && diff <=6) {
                    setColumnDefsAndSearchParam(fromDate, diff, searchParam);
                }else if(diff > 6) {
                    lincUtil.messagePopup("Tip", "Please select seven days at most to Search!");
                }
            }
            searchAppointmentStatistics(searchParam);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        };
        
        function searchAppointmentStatistics(param) {
            $scope.searching = true;
            param.appointmentTimeTo = moment(param.appointmentTimeTo).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
            appointmentService.appointmentStatistics(param).then(function (response) {
                $scope.searching = false;
                $scope.schedule = response;
                // console.log(response);
            }, function () {
                $scope.searching = false;
            });
        }

        function setColumnDefsAndSearchParam(fromDataMoment, diffDayNum, searchParam) {
            var columnDefs1 = angular.copy(columnDefs);
            var fromData = fromDataMoment.format("MM/DD/YYYY");
            searchParam.appointmentTimeFrom =  fromDataMoment.format("YYYY-MM-DDTHH:mm:ss");
            searchParam.appointmentTimeTo = angular.copy(fromDataMoment).add(diffDayNum, 'days').format("YYYY-MM-DDTHH:mm:ss");
            $scope.search.appointmentTimeFrom =  fromDataMoment.format("YYYY-MM-DD");
            $scope.search.appointmentTimeTo = angular.copy(fromDataMoment).add(diffDayNum, 'days').format("YYYY-MM-DD");
            columnDefs1.push({headerName: fromData, field: fromData});
            for(var i=1; i<=diffDayNum; i++) {
                var day = angular.copy(fromDataMoment).add(i, 'days').format("MM/DD/YYYY");
                columnDefs1.push({headerName: day, field: day});
            }
            $scope.columnDefs = columnDefs1;
        }

        function init() {
            $scope.searchAppointmentStatistic({});
        }

        init();
    };

    controller.$inject = ['$scope', 'lincUtil', 'appointmentService'];
    return controller;
})