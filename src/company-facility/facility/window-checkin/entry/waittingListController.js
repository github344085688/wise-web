'use strict';

define(['angular', 'lodash', 'jquery', './changePriorityController', './changeWaitingToCheckinController'], function (angular, _, $, changePriorityController, changeWaitingToCheckinController) {
    var controller = function ($scope, $state, entryService, lincUtil, $mdDialog,$interval) {

        $scope.taskPrioritys = ["LOW", "MIDDLE", "HIGH", "TOP"];

        $scope.isLoadingComplete = true;
        var current_page = 1;
        var timeInterval;
        $scope.intervalName ='Auto Reflesh';
        $scope.pageSize = 10;
        var waitTickets;
        function waittingSearch() {
            $scope.isLoadingComplete = false;
            entryService.waittingEntry().then(function (response) {
                waitTickets = response.tickets;
                $scope.isLoadingComplete = true;
                $scope.waittingList = response.tickets;
                $scope.waitInfoMap = response.waitInfoMap;

                $scope.loactionsMap = response.loactionsMap;
                $scope.loadTaskMap = response.loadTaskMap;
                $scope.receiptTaskMap = response.receiptTaskMap;
                $scope.selectedEntry = [];
                $scope.loadContent(current_page);
                initSelectedEntry();
            }, function (error) {
                $scope.isLoadingComplete = true;
                lincUtil.processErrorResponse(error);
            });

        }

        $scope.refreshWaitingAterTimer =function(){
            if( $scope.intervalName === 'Auto Reflesh'){
                $scope.intervalName ='Pause';
                timeInterval = $interval(function () {
                    waittingSearch();
                }, 10000);
            }else{
                $scope.intervalName ='Auto Reflesh';
                $interval.cancel(timeInterval);
            }
            
           
        }

        $scope.loadContent = function (currentPage) {
            current_page = currentPage;
            $scope.current_page = currentPage;
            $scope.waittingListView = $scope.waittingList.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.waittingList.length ? $scope.waittingList.length : currentPage * $scope.pageSize);
        };

        $scope.changeExpedite = function (entry) {
            var updateEntry = angular.copy(entry);
            if (!updateEntry.expediteFee) {
                updateEntry.expediteFee = true;
            } else {
                updateEntry.expediteFee = false;
            }
            lincUtil.confirmPopup("Expedite Fee Confirm", "Are you sure you want to expedite this entry?", function () {
                entryService.setEntryExpediteFee(updateEntry).then(function (response) {
                    lincUtil.saveSuccessfulPopup(function () {
                        init();
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.readyToCheckIn = function (entry) {
            var entryId = entry.id;
            var form = {
                templateUrl: 'company-facility/facility/window-checkin/entry/template/changeWaitingToCheckin.html',
                locals: {
                    checkInParams: {
                        entry: entry,
                        waitInfo: $scope.waitInfoMap[entry.id],
                        loadTask: $scope.loadTaskMap[entry.id],
                        receiptTask: $scope.receiptTaskMap[entry.id]
                    }

                },
                autoWrap: true,
                controller: changeWaitingToCheckinController
            };
            $mdDialog.show(form).then(function (response) {
                if (response == 'success') {
                    lincUtil.saveSuccessfulPopup();
                    waittingSearch();
                }
                else {
                    lincUtil.processErrorResponse(response);
                }


            });


        };

        $scope.searchEntryById = function (entryId) {

            if (!entryId || entryId.trim() === "") {
                waittingSearch();
            } else {
                $scope.isLoadingComplete = false;
                var ticket = _.find(waitTickets, function (ticket) {
                    return ticket.id == entryId || ticket.id == "ET-" + entryId;
                })

                $scope.waittingList = [];
                if (ticket) {
                    $scope.waittingList.push(ticket);
                    $scope.loadContent(current_page);
                    $scope.isLoadingComplete = true;
                }
                else {
                    $scope.loadContent(current_page);
                    $scope.isLoadingComplete = true;
                }
            }
        };

        $scope.isDockBusy = function (dockStatus) {
            if (!dockStatus) return false;

            if (dockStatus.toUpperCase() == "OCCUPIED" || dockStatus.toUpperCase() == "RESERVED") {
                return true;
            }
            return false;
        }

        function initSelectedEntry() {
            $scope.expandWaitingLine = [];
            var len = $scope.waittingListView.length;
            for (var i = 0; i < len; i++) {
                $scope.expandWaitingLine[i] = false;

            }
        }
        $scope.selectedEntry;
        $scope.selectEntry = function (entry, $event, index) {
            $scope.expandWaitingLine[index] = !$scope.expandWaitingLine[index];

            $scope.selectedEntry[index] = entry;
            // var tr = $($event.target).parentsUntil("tbody");
            // if (!tr) {
            //     tr = $($event.target).parentsUntil("table");
            // }
            // tr = tr[tr.length - 1];
            // $("#entryInfo").insertAfter($(tr));
        };

        $scope.changePriority = function (entry) {
            var entryId = entry.id;
            var form = {
                templateUrl: 'company-facility/facility/window-checkin/entry/template/changePriority.html',
                locals: {
                    waitingInfo: $scope.waitInfoMap[entry.id],
                    entryName: entry.id
                },
                autoWrap: true,
                controller: changePriorityController
            };
            $mdDialog.show(form).then(function (response) {
                var watitingInfo = angular.copy($scope.waitInfoMap[entryId]);
                watitingInfo.priority = response.priority;
                watitingInfo.contactInfo = response.contactInfo;
                entryService.updateWaiting(entryId, watitingInfo).then(function (response) {

                    init();
                    lincUtil.saveSuccessfulPopup();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        function init() {
            waittingSearch();
       
        }
        init();

        $scope.$on(
            "$destroy",
            function (event) {
                $interval.cancel(timeInterval);
            }
        );
    };
    controller.$inject = ['$scope', '$state', 'entryService', 'lincUtil', '$mdDialog','$interval'];
    return controller;
});
