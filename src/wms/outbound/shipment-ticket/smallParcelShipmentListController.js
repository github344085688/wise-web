'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {

    var controller = function ($scope, lincUtil, smallParcelShipmentService) {

        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";

        $scope.paging ={ limit: 10 };
        var currentViewPage;
        $scope.statusList = ['New', 'Loading', 'Closed'];

        $scope.smallParcelShipment = {};
        $scope.colDefs = [
            { headerName: 'Carrier Name', field: 'carrierId', sort: true },
            { headerName: 'Shipment Info Id', field: 'shipmentInfoId', sort: true },
            { headerName: 'Lookup Id', field: 'lookupId' },
            { headerName: 'Printer', field: 'printer' , sort: true},
            { headerName: 'Hlp Id', field: 'hlpId', sort: true },
            { headerName: 'Tracking No', field: 'trackingNo', sort: true },
            { headerName: 'Created By', field: 'createdBy', sort: true },
            { headerName: 'Updated By', field: 'updatedBy', sort: true },
            { headerName: 'Created Time', field: 'createdWhen', sort: true },
            { headerName: 'Update Time', field: 'updatedWhen' , sort: true }
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
        }

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
            $scope.smallParcelShipment.sortingFields = [fieldName];
            $scope.smallParcelShipment.sortingOrder = sort;
            $scope.loadContent(currentViewPage);
        }


        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchSmallParcelShipment();
            }
            $event.preventDefault();
        }

        $scope.searchSmallParcelShipment = function () {
            $scope.loadContent(1);
        };


        $scope.loadContent = function (currentPage) {
            currentViewPage = currentPage;
            $scope.smallParcelShipments = [];
            $scope.loading = true;
            var param = angular.copy($scope.smallParcelShipment);
            if(param.itemSpecId){
                param.itemSpecIds=[];
                param.itemSpecIds.push(param.itemSpecId);
            }
            param.paging = { pageNo: Number(currentPage), limit:   $scope.paging.limit};
            smallParcelShipmentService.searchSmallParcelShipmentsByPaging(param).then(function (response) {
                $scope.smallParcelShipments = response.shipments;
                $scope.loading = false;
                $scope.paging = response.paging;
               
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });


        }

        function init() {
            initSorts();
            $scope.loadContent(1);
        }

        init();
      
    };
    controller.$inject = ['$scope', 'lincUtil', 'smallParcelShipmentService'];
    return controller;
});
