'use strict';

define(['angular', 'lodash', 'jquery'], function (angular, _, $) {
    var documentProgressController = function ($scope, $resource, session, monitorService, $interval, lincUtil) {

        $scope.inProgressReceiptPager = { pageSize: 4, currentPage: 0, totalPage: 0 };
        $scope.inProgressOrderPager = { pageSize: 4, currentPage: 0, totalPage: 0 };
        $scope.internalStatusOrdersPager = { pageSize: 4, currentPage: 0, totalPage: 0 };



        var progressInterval;
        var timeInterval;
        function _init() {
            $scope.currentFacilityAndCompany = session.getCompanyFacility();
            getInProgressReceipts();
            getInProgressOrders();
            getInternalStatusOrders();
            getDateTime();
            progressInterval = $interval(function () {
                getInProgressReceipts();
                getInProgressOrders();
                getInternalStatusOrders();

            }, 10000);

            timeInterval = $interval(function () {
                getDateTime();
            }, 1000);
        }
        function getDateTime() {
            var currentDateandTime = lincUtil.getCurrentDateAndTime();
            $scope.currentTime = currentDateandTime.currentTime;
            $scope.currentHMS = currentDateandTime.currentHMS;
        }


        $scope.widthPer = function (doc) {
            var per = Math.floor(doc.progress * 100) + '%';
            return per;
        }
        $scope.widthPer25 = function (doc) {
            var per = doc.progress * 100 >= 25 ? '100%' : Math.floor(((doc.progress * 100) / 25) * 100) + '%';
            return per;
        }
        $scope.widthPer50 = function (doc) {
            var per = doc.progress * 100 >= 50 ? '100%' : Math.floor(((doc.progress * 100 - 25) / 25) * 100) + '%';
            return per;
        }
        $scope.widthPer75 = function (doc) {
            var per = doc.progress * 100 >= 75 ? '100%' : Math.floor(((doc.progress * 100 - 50) / 25) * 100) + '%';
            return per;
        }
        $scope.widthPer100 = function (doc) {
            var per = doc.progress * 100 >= 100 ? '100%' : Math.floor(((doc.progress * 100 - 75) / 25) * 100) + '%';
            return per;
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

        function getInProgressReceipts() {
            monitorService.getInProgressReceipts().then(function (res) {
                $scope.inProgressReceipts = res;
                loadContentPage($scope.inProgressReceiptPager, $scope.inProgressReceipts, "inProgressReceiptsView");

            }, function (err) {
                $scope.inProgressReceipts = [];
                loadContentPage($scope.inProgressReceiptPager, [], "inProgressReceiptsView");
            })
        }

        function getInProgressOrders() {
            monitorService.getInProgressOrders().then(function (res) {
                $scope.inProgressOrders = res;
                loadContentPage($scope.inProgressOrderPager, $scope.inProgressOrders, "inProgressOrdersView");
            }, function (err) {
                $scope.inProgressOrders = [];
                loadContentPage($scope.inProgressOrderPager, [], "inProgressOrdersView");
            })
        }

        function getInternalStatusOrders() {
            monitorService.getInternalStatusOrders().then(function (res) {
                $scope.internalStatusOrders = res;
                loadContentPage($scope.internalStatusOrdersPager, $scope.internalStatusOrders, "internalStatusOrdersView");
            }, function (err) {
                $scope.internalStatusOrders = [];
                loadContentPage($scope.internalStatusOrdersPager, [], "internalStatusOrdersView");
            })
        }


        function $$(selector, context) {
            context = context || document;
            var elements = context.querySelectorAll(selector);
            return Array.prototype.slice.call(elements);
        }





        $scope.cavanPieSvg = function (param, id) {
            $$('.piesvg').forEach(function (pie) {
                var p = parseFloat(pie.id);
                if (pie.id == id) {
                    var NS = "http://www.w3.org/2000/svg";
                    var svg = document.createElementNS(NS, "svg");
                    var circle = document.createElementNS(NS, "circle");
                    var title = document.createElementNS(NS, "title");

                    circle.setAttribute("r", 16);
                    circle.setAttribute("cx", 16);
                    circle.setAttribute("cy", 16);
                    circle.setAttribute("stroke-dasharray", param + " 100");

                    svg.setAttribute("viewBox", "0 0 32 32");
                    title.textContent = pie.textContent;
                    pie.textContent = '';
                    svg.appendChild(title);
                    svg.appendChild(circle);
                    pie.appendChild(svg);
                }
            });

        };



        $scope.formatSeconds = function (value) {
            return lincUtil.formatTimestampDuration(value);
        };

        _init();

        $scope.$on(
            "$destroy",
            function (event) {
                $interval.cancel(progressInterval);
                $interval.cancel(timeInterval);
            }
        );
    };

    documentProgressController.$inject = ['$scope', '$resource', 'session', 'monitorService', '$interval', 'lincUtil'];
    return documentProgressController;
});