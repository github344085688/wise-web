'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, entry, printService) {

        $scope.selectedEntries = [];
        $scope.selectedOutboundLoads = [];
        $scope.selectedOutboundOrders = [];
        $scope.errors = [];
        $scope.printCompleted = true;
        $scope.documentCount = 0;
        $scope.printLabelSelection = {
            gateCheckOutLabel: false
        };

        $scope.activedPrintTab = "entry";

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.previewEntry = function (entryId) {
            var url = $state.href('entryPrint', {
                entryId: entryId
            });
            window.open(url);
        };

        $scope.previewEntryTicketCheckout = function (entryId) {
            var url = $state.href('entryTicketCheckoutLabelPrint', {
                entryId: entryId
            });
            window.open(url);
        };

        $scope.onPrintLabelChecked = function(labelOption){
            $scope.printLabelSelection[labelOption] = !$scope.printLabelSelection[labelOption];
        };
        
        $scope.previewMasterBOL = function (loadId) {
            if (loadId) {
                var url = $state.href('mbolPrint', { loadId: loadId });
                window.open(url);
            }
        };

        $scope.previewCountingSheet = function (entryId, loadId) {
            var url = $state.href('countingSheetPrint', {
                entryId: entryId,
                loadId: loadId
            });
            window.open(url);
        };

        $scope.previewPackingListPrint = function (loadId, orderId) {
            if (loadId) {
                var url = $state.href('loadPackingListPrint', { loadId: loadId, orderId: orderId });
                window.open(url);
            }
        };

        $scope.previewOrderBol = function (loadId, orderId) {
            if (loadId) {
                var url = $state.href('orderBolPrint', { loadId: loadId, orderId: orderId });
                window.open(url);
            }
        };

        $scope.printBolByShipTo = function (loadId) {
            if (loadId) {
                var url = $state.href('loadByShipToBolPrint', { loadId: loadId });
                window.open(url);
            }
        };

        $scope.printBolByOrder = function (loadId) {
            if (loadId) {
                var url = $state.href('bolPrint', { loadId: loadId });
                window.open(url);
            }
        };

        $scope.printOrderPackingListPrint = function (orderId) {
            if (orderId) {
                var url = $state.href('orderPackingListPrint', {orderId: orderId });
                window.open(url);
            }
        };
        
        $scope.printFile = function (fileId) {
            if(fileId) {
                var url = $state.href('printFile', { fileId: "343" });
                window.open(url);
            }
        };
        $scope.ok = function () {
            var entryTicket = {};
            entryTicket.checkedEntryActions = $scope.checkedEntryActions;

            $mdDialog.hide(entryTicket);
        };

        $scope.pods = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
            if (tab == "entry") {
                $scope.entryActivetab = "entryTicket";
                $scope.activedPrintTab = "entry";
            }
            if (tab == "inbound") {
                $scope.inboundActivetab = "pod";
            }
            if (tab == "outbound") {
                if(!$scope.outboundActivetab) {
                    $scope.outboundActivetab = "shipinglable";
                    $scope.activedPrintTab = $scope.outboundActivetab;
                }
            }

        };

        $scope.changeOutboundTab = function (tab) {
            if (tab == "shipinglable") {
                $scope.outboundActivetab = "shipinglable";
            }
            if (tab == "bol") {
                $scope.outboundActivetab = "bol";
            }
            if (tab == "packinglist") {
                $scope.outboundActivetab = "packinglist";
            }
            if (tab == "countingsheet") {
                $scope.outboundActivetab = "countingsheet";
            }
            if (tab == "cartonlabel") {
                $scope.outboundActivetab = "cartonlabel";
            }
            $scope.activedPrintTab = tab;
        };

        $scope.changeInboundTab = function (tab) {
            if (tab == "pod") {
                $scope.inboundActivetab = "pod";
            }

            if (tab == "packinglist") {
                $scope.inboundActivetab = "packinglist";
            }

            if (tab == "lplabel") {
                $scope.inboundActivetab = "lplabel";
            }
            $scope.activedPrintTab = tab;
        };

        $scope.isAllOutboundChecked = false;
        $scope.checkAllOutbound = function () {
            $scope.isAllOutboundChecked = !$scope.isAllOutboundChecked;
            if ($scope.isAllOutboundChecked) {
                $scope.selectedOutboundLoads = _.map($scope.entry.loads, "id");
                $scope.selectedOutboundOrders = Object.keys($scope.ordeLineMap);
            } else {
                $scope.selectedOutboundLoads = [];
                $scope.selectedOutboundOrders = [];
            }
        };

        $scope.checkEntry = function (entryId) {
            if(_.indexOf($scope.selectedEntries, entryId) > -1 ) {
                $scope.selectedEntries = _.remove($scope.selectedEntries, entryId);
            } else {
                $scope.selectedEntries.push(entryId);
            }
        };


        $scope.checkLoad = function(loadId) {
            if(_.indexOf($scope.selectedOutboundLoads, loadId) > -1 ) {
                $scope.selectedOutboundLoads = _.remove($scope.selectedOutboundLoads, loadId);
            } else {
                $scope.selectedOutboundLoads.push(loadId);

            }
        };

        $scope.isLoadChecked = function(loadId) {
            return _.indexOf($scope.selectedOutboundLoads, loadId) > -1;
        };

        $scope.isOrderChecked = function(orderId) {
            return _.indexOf($scope.selectedOutboundOrders, orderId) > -1;
        };

        $scope.checkOrder = function(orderId) {
            if(_.indexOf($scope.selectedOutboundOrders, orderId) > -1 ) {
                $scope.selectedOutboundOrders = _.remove($scope.selectedOutboundOrders, orderId);
            } else {
                $scope.selectedOutboundOrders.push(orderId);
            }
        };



        $scope.isInboundChecks = function (action) {
            return _.indexOf($scope.InboundChecks, action.id) > -1;
        };

        $scope.changeTab('entry');

        function checkIfThePrintWasComplete(){
            $scope.documentCount--;
            if($scope.documentCount === 0) {
                $scope.printCompleted = true;
            }
        }

        $scope.print = function(){
            $scope.errors = [];
            if(checkIfSelectTheRightPrintType()) {
                if ($scope.activedPrintTab === "entry") {
                    $scope.printEntries();
                    $scope.printGateCheckOutLabel();
                } else if ($scope.activedPrintTab === "shipinglable") {
                    $scope.printShippingLabel();
                } else if ($scope.activedPrintTab === "bol") {
                    $scope.printBol();
                } else if ($scope.activedPrintTab === "packinglist") {
                    $scope.printPackingList();
                } else if ($scope.activedPrintTab === "countingsheet") {
                    $scope.printCountingSheet();
                }
            }
        };


        function checkIfSelectTheRightPrintType() {
            $scope.documentCount--;
            if ($scope.activedPrintTab === "entry" || $scope.activedPrintTab === "shipinglable") {
                if ( !$scope.selectedPrinter || $scope.selectedPrinter.type.toLowerCase() !== "zpl") {
                    $scope.errors.push("Please select an ZPL printer");
                    return false;
                }
            } else if ($scope.activedPrintTab === "packinglist" || $scope.activedPrintTab === "bol" || $scope.activedPrintTab === "countingsheet") {
                if (!$scope.selectedPrinter || $scope.selectedPrinter.type.toLowerCase() !== "pdf") {
                    $scope.errors.push("Please select an PDF printer");
                    return false;
                }
            }
            return true;
        }

        $scope.printCountingSheet = function(){
            if($scope.selectedOutboundLoads.length > 0 ){
                $scope.documentCount = $scope.selectedOutboundLoads.length;
                $scope.printCompleted = false;
                for(var index in $scope.selectedOutboundLoads) {
                    printService.printCountingSheetDirectly($scope.selectedPrinter, $scope.entry.id ,$scope.selectedOutboundLoads[index]).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    });
                }
            } else {
                $scope.errors.push("Please select an order or a load at least!");
            }
        };



        $scope.printPackingList = function(){
            if($scope.selectedOutboundOrders.length > 0  ){
                $scope.documentCount = $scope.selectedOutboundOrders.length;
                $scope.printCompleted = false;
                for(var index in $scope.selectedOutboundOrders) {
                    printService.printPackagingListDirectly($scope.selectedPrinter, $scope.selectedOutboundOrders[index]).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    })
                }
            } else {
                $scope.errors.push("Please select an order or a load at least!");
            }
        };

        $scope.printBol = function(){
            if($scope.selectedOutboundOrders.length > 0 || $scope.selectedOutboundLoads.length  > 0){
                $scope.documentCount = $scope.selectedOutboundOrders.length + $scope.selectedOutboundLoads.length ;
                $scope.printCompleted = false;
                for(var index in $scope.selectedOutboundOrders) {
                    var orderId = $scope.selectedOutboundOrders[index];
                    printService.printOrderBOLDirectly($scope.selectedPrinter, $scope.ordeLineMap[orderId].loadId, orderId).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    })
                }
                for(var index in $scope.selectedOutboundLoads) {
                    printService.printLoadMasterBOLDirectly($scope.selectedPrinter, $scope.selectedOutboundLoads[index]).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    })
                }
            } else {
                $scope.errors.push("Please select an order or a load at least!");
            }
        };

        $scope.printShippingLabel = function(){
            if($scope.selectedOutboundOrders.length > 0){
                $scope.documentCount = $scope.selectedOutboundOrders.length ;
                $scope.printCompleted = false;
                for(var index in $scope.selectedOutboundOrders) {
                    printService.printShippingLabelDirectly($scope.selectedPrinter, $scope.selectedOutboundOrders[index]).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    })
                }
            } else {
                $scope.errors.push("Please select an order at least!");
            }
        };

        $scope.printEntries = function() {
            if($scope.selectedEntries.length > 0){
                $scope.documentCount = $scope.selectedEntries.length ;
                $scope.printCompleted = false;
                for(var index in $scope.selectedEntries) {
                    printService.printEntryLabelDirectly($scope.selectedPrinter, $scope.selectedEntries[index]).then(function(){
                        checkIfThePrintWasComplete();
                    }, function(err){
                        checkIfThePrintWasComplete();
                        $scope.errors.push(err);
                    })
                }
            } else {
                // $scope.errors.push("Please select an entry at least!");
            }

        };

        
        $scope.printGateCheckOutLabel = function() {

            if($scope.printLabelSelection.gateCheckOutLabel){
                $scope.printCompleted = false;
                printService.printEntryTicketCheckoutLabelDirectly($scope.selectedPrinter, $scope.entry.id).then(function(){
                       $scope.printCompleted = true;
                    }, function(err){
                        $scope.printCompleted = true;
                        $scope.errors.push(err);
                    })
            }

        };

        $scope.printerSelect = function(printer){
              $scope.selectedPrinter = printer;
        };

        function init() {
            $scope.entry = entry;
            $scope.ordeLineMap = {};
            $scope.loadMap = _.keyBy($scope.entry.loads,"id");
            for(var i in entry.loads){
                $scope.ordeLineMap = _.assign($scope.ordeLineMap, _.keyBy(entry.loads[i].orderLines, "orderId"));
            }
        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'entry', 'printService'];
    return controller;
});
