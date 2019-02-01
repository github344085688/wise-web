'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var documentOverviewController = function ($scope, $resource, session, monitorService, $interval,lincUtil) {

        $scope.scheduledDocumentPager = { pageSize: 4, currentPage: 0, totalPage: 0 };
        $scope.unAssignedDocumentPager = { pageSize: 4, currentPage: 0, totalPage: 0 };
        $scope.assignedDocumentPager = { pageSize: 5, currentPage: 0, totalPage: 0 };

        var overViewInterval;
        var timeInterval; 
        function _init() {
            $scope.currentFacilityAndCompany = session.getCompanyFacility();
            getTodaySchedule();
            getUnAssignedDocuments();
            getAssignedDocuments();
            getDateTime();
            overViewInterval = $interval(function () {
                getTodaySchedule();
                getUnAssignedDocuments();
                getAssignedDocuments();

            }, 10000);
          timeInterval=  $interval(function () {
                getDateTime();
            }, 1000);
        }


        _init();

        function getDateTime() {
            var currentDateandTime = lincUtil.getCurrentDateAndTime();
            $scope.currentTime = currentDateandTime.currentTime;
            $scope.currentHMS = currentDateandTime.currentHMS;
        }

        function loadContentPage(pager, contents, contentView) {
            if (contents.length > 0) {
                pager.totalPage = Math.ceil(contents.length / pager.pageSize);
                pager.currentPage = pager.currentPage + 1;
                if (pager.currentPage > pager.totalPage) {
                    pager.currentPage = 1;
                }
                $scope[contentView] = contents.slice((pager.currentPage - 1) * pager.pageSize,
                    pager.currentPage * pager.pageSize > contents.length ? contents.length : pager.currentPage * pager.pageSize);
            } else {
                pager.currentPage = 0;
            }
        }


        function getTodaySchedule() {
            monitorService.getScheduledDocuments().then(function (res) {
                $scope.scheduledDocuments = res.receipts.concat(res.orders);
                loadContentPage($scope.scheduledDocumentPager, $scope.scheduledDocuments, "scheduledDocumentView");
            }, function (err) {
                $scope.scheduledDocuments = [];
                loadContentPage($scope.scheduledDocumentPager, $scope.scheduledDocuments, "scheduledDocumentView");

            })
        }

        function getUnAssignedDocuments() {
            monitorService.getUnAssignedDocuments().then(function (res) {
                $scope.unAssignedDocuments = res.receipts.concat(res.orders);
                loadContentPage($scope.unAssignedDocumentPager, $scope.unAssignedDocuments, "unAssignedDocumentView");
            }, function (err) {
                $scope.unAssignedDocuments = [];
                loadContentPage($scope.unAssignedDocumentPager, $scope.unAssignedDocuments, "unAssignedDocumentView");
            })
        }

        function getAssignedDocuments() {
            monitorService.getAssignedDocuments().then(function (res) {
                $scope.assignedDocuments = res.receipts.concat(res.orders);
                loadContentPage($scope.assignedDocumentPager, $scope.assignedDocuments, "assignedDocumentView");

            }, function (err) {
                $scope.assignedDocuments = [];
                loadContentPage($scope.assignedDocumentPager, $scope.assignedDocuments, "assignedDocumentView");
            })
        }


        $scope.formatSeconds =function(value){
            return lincUtil.formatTimestampDuration(value);
         };

        $scope.$on(
            "$destroy",
            function (event) {
                $interval.cancel(overViewInterval);
                $interval.cancel(timeInterval);
            }
        );

    };

    documentOverviewController.$inject = ['$scope', '$resource', 'session', 'monitorService', '$interval','lincUtil'];
    return documentOverviewController;
});