'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {

    var controller = function ($scope, lincUtil, shipmentTicketService, ediService,$http) {

        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";


        $scope.pageSize = 10;
        var currentViewPage;
        $scope.statusList = ['New', 'Loading', 'Closed'];
        $scope.dcSendStatuses = [{name:'Yes',dbName:true},{name:'No',dbName:false}];
        $scope.isSendingDC = {};
        $scope.isResendingDC = {};

        $scope.shipmentTicket = {};
        $scope.colDefs = [
            { headerName: 'Shipment Ticket ID', field: '_id', sort: true },
            { headerName: 'Order ID', field: 'orderId', sort: true },
            { headerName: 'Load ID', field: 'loadId', sort: true },
            { headerName: 'Customer', field: 'customerName' },
            { headerName: 'MBOL', field: 'masterBolNo' },
            { headerName: 'Status', field: 'status' , sort: true},
            { headerName: 'DC Sent', field: 'dcSendStatus', sort: true },
            { headerName: 'Loaded LP', field: 'loadedSlpIds', sort: true },
            { headerName: 'CreatedBy', field: 'createdBy', sort: true },
            { headerName: 'UpdatedBy', field: 'updatedBy', sort: true },
            { headerName: 'Created Time', field: 'createdWhen', sort: true },
            { headerName: 'Closed Time', field: 'closedWhen' , sort: true }
        ];
        function initSorts() {
            $scope.sorts = [];
            var len = $scope.colDefs.length;
            for (var i = 0; i < len; i++) {
                $scope.sorts.push(SORT_DEFAULT);
            }
            $scope.sortsClass = {
                default: 'order-sorting',
                asc: 'order-sorting order-sorting-asc',
                desc: 'order-sorting order-sorting-desc'
            };
        };

        $scope.getSortClass = function(index) {
            if($scope.colDefs[index].sort) {
               return $scope.sortsClass[$scope.sorts[index]];
            }
        };

        $scope.sortClick = function (index) {
            if(!$scope.colDefs[index].sort) {
                return;
            }
            var sort = $scope.sorts[index];
            var sortField = $scope.colDefs[index].field;
            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    orderByHeader(sortField, 1);
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    orderByHeader(sortField, -1);
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    orderByHeader(sortField, 1);
                    break;
            }

        };

        function sortDefault(index) {
            angular.forEach($scope.sorts, function (value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        };

        function orderByHeader(fieldName, sort) {
            $scope.shipmentTicket.sortingFields = [fieldName];
            $scope.shipmentTicket.sortingOrder = sort;
            $scope.loadContent(currentViewPage);
        }


        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchShippmentTicket();
            }
            $event.preventDefault();
        };

        $scope.searchShippmentTicket = function () {
            $scope.loadContent(1);
        };


        $scope.loadContent = function (currentPage) {
            currentViewPage = currentPage;
            $scope.shipmentTickets = [];
            $scope.loading = true;
            var param = angular.copy($scope.shipmentTicket);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            shipmentTicketService.searchShippmentTickets(param).then(function (response) {
                $scope.shipmentTickets = response.shipmentTickets;
                $scope.loading = false;
                $scope.paging = response.paging;
               
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.sendDC = function(shipmentTicketId, orderId) {
              lincUtil.confirmPopup("Send DC Confirm", "Are you sure to send DC for  shipment ticket (" +  shipmentTicketId + ")/order (" + orderId + ")"
                  , function() {
                      $scope.isSendingDC[shipmentTicketId] = true;
                      ediService.sendDC(shipmentTicketId, orderId).then(function (data) {
                          lincUtil.messagePopup("Send DC", "Sent DC Successful for shipment ticket (" + shipmentTicketId + ")/order (" + orderId + ")");
                          $scope.isSendingDC[shipmentTicketId] = false;
                      }, function (err) {
                          lincUtil.processErrorResponse(err);
                          $scope.isSendingDC[shipmentTicketId] = false;
                      })
                  }
              );

        };

        $scope.resendDC = function(shipmentTicketId, orderId) {
            lincUtil.confirmPopup("Resend DC Confirm", "The DC had sent successful before ,  are you sure to send it again ?"
                , function() {
                    $scope.isResendingDC[shipmentTicketId] = true;
                    ediService.resendDC(shipmentTicketId, orderId).then(function (data) {
                        lincUtil.messagePopup("Resend DC", "Resend DC Successful for shipment ticket (" + shipmentTicketId + ")/order (" + orderId + ")");
                        $scope.isResendingDC[shipmentTicketId] = false;
                    }, function (err) {
                        lincUtil.processErrorResponse(err);
                        $scope.isResendingDC[shipmentTicketId] = false;
                    })
                }
            );

      };

        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/outbound/shipment-ticket/export-excel", $scope.shipmentTicket, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "shipmentTicket.xls");

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.exporting = false;
            });
        }



        function init() {
            initSorts();
            $scope.loadContent(1);
        }

        init();
      
    };
    controller.$inject = ['$scope', 'lincUtil', 'shipmentTicketService', 'ediService','$http'];
    return controller;
});
