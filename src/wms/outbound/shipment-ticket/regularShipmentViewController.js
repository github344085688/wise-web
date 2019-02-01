'use strict'
define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, shipmentTicketService, $resource, $state, $stateParams, lincUtil) {
        $scope.ticketId = $stateParams.ticketId;

        getShippmentTicket($scope.ticketId);
        function getShippmentTicket(ticketId) {

            shipmentTicketService.getShippmentTicketById(ticketId).then(function (data) {
                $scope.shipmentTick = data;
            });
        };
        $scope.printPackingListPrint = function (loadId, orderId) {
            $scope.printPackingList = true;
            lincUtil.setPropetyToFalseAfterSeconds($scope, "printPackingList");
            if (loadId) {
                var url = $state.href('loadPackingListPrint', { loadId: loadId, orderId: orderId });
                window.open(url);
            }
        };

        $scope.close = function (ticketId) {
            lincUtil.confirmPopup('Close Confirm', 'Would you like to close this ticket?', function () {
                $scope.isClose = true;
                shipmentTicketService.closeShippmentTicket(ticketId).then(function (response) {
                    $scope.isClose = false;
                    lincUtil.messagePopup("Message", "Close Successful.", function () {
                        getShippmentTicket($scope.ticketId);
                    });
                }, function (error) {
                    $scope.isClose = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        };
    };
    controller.$inject = ['$scope', 'shipmentTicketService', '$resource', '$state', '$stateParams', 'lincUtil'];
    return controller;
});