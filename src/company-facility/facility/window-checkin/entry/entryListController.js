'use strict';

define(['angular',
    'lodash',
    'moment',
    './createEntryController',
    './receiptViewDialogController',
    './loadViewDialogController',
    './entryDocumentController',
    './entryGalleryController',
    './entryLogController',
    './reportExceptionController'
], function (angular, _, moment, createEntryController, receiptViewDialogController, loadViewDialogController, entryDocumentController, entryGalleryController,entryLogController,reportExceptionController) {
    var controller = function ($scope, $state, $mdDialog, organizationService, entryService, lincUtil, session) {
        $scope.createEntry = function (ev) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/createEntry.html';
            lincUtil.popupBodyPage(createEntryController, templateUrl, ev, {
                types: [],
                isEdit: false
            }).then(function (entryTicket) {
                if (entryTicket.checkedEntryActions.length === 0) {
                    lincUtil.messagePopup("Please select at least one entry purpose!");
                    return;
                }
                var entry = {};
                entry.checkInTypes = entryTicket.checkedEntryActions;
                entry.entryType = "Window";
                entryService.createEntry(entry).then(function (response) {
                    if(response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    entry.id = response.id;
                    lincUtil.confirmPopup("Entry Create", "Entry has been created successful, Entry Id is:" + response.id + ", Start window check in now？", function () {
                        $scope.toWindow(response.id);
                    });
                    if($scope.entryList) {
                        $scope.entryList.unshift(entry);
                    }
                    // search({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }, function (err) {
            });
        };

        $scope.editEntryPurpose = function (entry) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/createEntry.html';
            lincUtil.popupBodyPage(createEntryController, templateUrl, null, {
                types: entry.checkInTypes,
                isEdit: true
            }).then(function (entryTicket) {
                if (entryTicket.checkedEntryActions.length === 0) {
                    lincUtil.messagePopup("Please select at least one entry purpose!");
                    return;
                }
                entry.checkInTypes = entryTicket.checkedEntryActions;
                entry.checkAction = "Gate Checkin";
                //do update
                entryService.updateEntry(entry).then(function (response) {
                    if (response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    lincUtil.saveSuccessfulPopup();
                    // search({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

          $scope.entrySummary = function (entry) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/entryLog.html';
            lincUtil.popupBodyPage(entryLogController, templateUrl, null, {
                entry: entry
            }).then(function (res) {


            });
        };

        $scope.entryDocument = function (entry) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/entryDocument.html';
            lincUtil.popupBodyPage(entryDocumentController, templateUrl, null, {
                entry: entry
            }).then(function (res) {


            });
        };

        $scope.entryPhoto = function (entry) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/entryGallery.html';
            lincUtil.popupBodyPage(entryGalleryController, templateUrl, null, {
                entry: entry
            }).then(function (res) {


            });
        };

        $scope.reportException = function (entry, index) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/reportException.html';
            lincUtil.popupBodyPage(reportExceptionController, templateUrl, null, {
                entry: entry
            }).then(function (res) {
                if (res) {
                    lincUtil.saveSuccessfulPopup(function(){
                        init();
                    });
                }
            });
        };

        $scope.formatTime = function (time) {
            if (time) {
                return moment(time).format("YYYY-MM-DD HH:mm:ss");
            } else return "";
        };

        $scope.reset = function () {
            $scope.search = {};
        };

        $scope.getLocation = function (id) {
            if ($scope.locationMap[id]) {
                return $scope.locationMap[id].name;
            } else return "";
        };

        $scope.toWindow = function (entryId) {
            $state.go('cf.facility.windowCheckin.checkinProcess.carrierInfo', {
                entryId: entryId
            });


        };

        $scope.print = function (entryId) {
            var templateUrl = 'company-facility/facility/window-checkin/entry/template/printBOL.html';
            lincUtil.popupBodyPage(printBOLController, templateUrl, null, {
                entryId: entryId
            });
        };

        $scope.printEntry = function (entryId) {
            var url = $state.href('entryPrint', {
                entryId: entryId
            });
            window.open(url);
        };

        $scope.searchEntries = function(currentPage) {
            var param = $scope.search;
            $scope.searchCompleted = false;
            if (!param) {
                param = {};
            }
            param.excludeStatuses = ["New"];
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};

            return entryService.searchEntryByPaging(param).then(function (response) {
                groupEntryReceiptAndLoadByCustomer(response.entryTickets);
                $scope.entries = response.entryTickets;
                $scope.paging = response.paging;
                $scope.searchCompleted = true;
                resetViewConfig();
            }, function (error) {
                $scope.searchCompleted = true;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.switchViewMode = function(showAsList){
            $scope.viewSetting.entryList.showAsList = showAsList;
            renderEntries(showAsList)
            lincUtil.confirmPopup("Entry View Setting", "Would you like to save current view mode ? ", function(){
                 session.setUserViewSetting({entryList: {showAsList: showAsList}})
            });

        }

        function renderEntries(showAsList) {   
            for (var i = 0; i < $scope.entries.length; i++) {
                var entry  = $scope.entries[i]
                if(!$scope.entryView[entry.id]) {
                    $scope.entryView[entry.id] = {}
                }
                $scope.entryView[entry.id].showAsList = showAsList;
            }
        }


        function groupEntryReceiptAndLoadByCustomer(entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].receipts.length > 0) {
                    entries[i].receiptsGroupByCustomer = _.groupBy(entries[i].receipts, "customerName");
                }
                if (entries[i].loads.length > 0) {
                    entries[i].loadsGroupByCustomer = _.groupBy(entries[i].loads, "customerName");
                }
            }
        }

        $scope.loadContent = function (currentPage) {
            $scope.entryList = $scope.entries.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.entries.length ? $scope.entries.length : currentPage * $scope.pageSize);
        };

        $scope.isOutbound = function (types) {
            var outboundType = ['Load'];
            return _.intersection(types, outboundType).length > 0;
        };

        $scope.changeTab = function (tabName, entryIndex, entryId) {
            if (tabName === "info") $scope.ifShowTab[entryIndex] = {
                info: true,
                receipt: false,
                load: false,
                photo: false
            };
            else if (tabName === "receipt") $scope.ifShowTab[entryIndex] = {
                info: false,
                receipt: true,
                load: false,
                photo: false
            };
            else if (tabName === "load") $scope.ifShowTab[entryIndex] = {
                info: false,
                receipt: false,
                load: true,
                photo: false
            };
            else if (tabName === "photo") {
                $scope.ifShowTab[entryIndex] = { info: false, receipt: false, load: false, photo: true };
                getEntryPhoto(entryId);
            }

        };


        function getEntryPhoto(entryId) {
            $scope.loadingPhoto = true;
            entryService.getEntryPhotos({ tags: [entryId] }).then(function (response) {
                var e = _.find($scope.entries, function (o) {
                    return o.id === entryId;
                });
                e.photos = [];
                _.forEach(response, function (photo) {
                    e.photos.push({
                        id: photo.id,
                        photoType: photo.fileScenario,
                        url: "/file-app/file-download/" + photo.fileId,
                        createTime: photo.createdWhen
                    });
                });
                e.groupedPhotos = _.groupBy(e.photos, "photoType");
                $scope.loadingPhoto = false;
            });
        }

        $scope.toggleCard = function (entry, cardStyleByName) {
            if (!$scope.cardExpand[entry.id]) {
                $scope.cardExpand[entry.id] = {};
            }
            if ($scope.cardExpand[entry.id][cardStyleByName]) {
                $scope.cardExpand[entry.id][cardStyleByName] = undefined;
            } else {
                $scope.cardExpand[entry.id][cardStyleByName] = { height: 'auto' };
            }

            updateCardContainerDivHeight(entry);
        };

        function getAllCardNames(entry) {
            var allCardNames = ["checkInAndOut", "driver", "equipment", "log"];

            if (entry.loads) {
                allCardNames = _.concat(allCardNames, _.map(entry.loads, "id"))
            }
            if (entry.receipts) {
                allCardNames = _.concat(allCardNames, _.map(entry.receipts, "id"))
            }
            return allCardNames;
        }

        $scope.toggleAllCards = function (entry) {
            var cardNames = getAllCardNames(entry);
            if (!$scope.cardExpand[entry.id]) {
                $scope.cardExpand[entry.id] = {};
            }
            if ($scope.cardExpand[entry.id].allExpanded) {
                for (var index in cardNames) {
                    $scope.cardExpand[entry.id][cardNames[index]] = undefined;
                    $scope.cardExpand[entry.id].overall = undefined;
                }
            } else {
                for (var index in cardNames) {
                    $scope.cardExpand[entry.id][cardNames[index]] = { height: 'auto' };
                    $scope.cardExpand[entry.id].overall = { height: 'auto' };
                }
            }
            $scope.cardExpand[entry.id].allExpanded = !$scope.cardExpand[entry.id].allExpanded;

        };

        function updateCardContainerDivHeight(entry) {
            var cardNames = getAllCardNames(entry.id);
            for (var index in cardNames) {
                if ($scope.cardExpand[entry.id][cardNames[index]]) {
                    $scope.cardExpand[entry.id].overall = { height: 'auto' };
                    return
                }
            }
            $scope.cardExpand[entry.id].overall = {};
        };

        $scope.showAsList = function (entryId, showAsList) {
            if (!$scope.entryView[entryId]) {
                $scope.entryView[entryId] = {};
            }
            $scope.entryView[entryId].showAsList = showAsList;
        };

        $scope.showEntryActions = function (entryId) {
            if (!$scope.entryView[entryId]) {
                $scope.entryView[entryId] = {};
            }
            $scope.entryView[entryId].showActions = true;
        };

        $scope.showOutboundOrInbound = function (entryId,isShow) {
            if (!$scope.boundView[entryId]) {
                $scope.boundView[entryId] = {};
            }
            else {
                $scope.boundView[entryId].showBound = isShow;
            }

        };

        $scope.hideEntryActions = function (entryId) {
            $scope.entryView[entryId].showActions = false;
        };

        function resetViewConfig() {
            $scope.cardExpand = {};
            $scope.entryView = {};
            renderEntries($scope.viewSetting.entryList.showAsList)
        }



        $scope.showReceipt = function (receiptId) {
            $mdDialog.show({
                templateUrl: 'company-facility/facility/window-checkin/entry/template/receiptViewDialog.html',
                locals: {
                    receiptId: receiptId
                },
                autoWrap: true,
                controller: receiptViewDialogController
            }).then(function () { }, function () { });
        };

        $scope.showLoad = function (loadId) {
            $mdDialog.show({
                templateUrl: 'company-facility/facility/window-checkin/entry/template/loadViewDialog.html',
                locals: {
                    loadId: loadId
                },
                autoWrap: true,
                controller: loadViewDialogController
            }).then(function () { }, function () { });
        };

        function init() {
            initEntryDisplaySetting()
            $scope.search = {};
            $scope.pageSize = 10;
            $scope.searchEntries(1);
            $scope.cardExpand = {};
            $scope.entryView = {};
            $scope.boundView = {};
            $scope.entryStatuses = ["Gate Checked In", "Waiting", "Need Window Check In", "Window Checked In", "Dock Checked In", "Dock Checked Out", "Gate Checked Out", "Reject"];
        }

        function initEntryDisplaySetting() {

            var userViewSetting = session.getUserViewSetting()
            if (userViewSetting && userViewSetting.entryList) {
                  $scope.viewSetting = {entryList: {showAsList: userViewSetting.entryList.showAsList}}
            } else {
                $scope.viewSetting = {entryList: {showAsList: false}}
            }
        } 

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchEntries(1);
            }
            $event.preventDefault();
        };
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'organizationService', 'entryService', 'lincUtil','session'];
    return controller;
});