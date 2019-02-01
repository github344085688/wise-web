'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $resource, $mdDialog, printService, lincUtil, trackingNos) {

        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.checkedItemLine = [];

        $scope.toggleAll = function () {
            if (!$scope.shipmentDetailLists) return;
            if ($scope.selectAllIsChecked()) {
                $scope.checkedItemLine = [];
            } else {
                $scope.checkedItemLine = angular.copy($scope.shipmentDetailLists);
            }


        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.shipmentDetailLists) return;
            if (!$scope.checkedItemLine || $scope.checkedItemLine.length == 0) return false;
            if ($scope.checkedItemLine.length === $scope.shipmentDetailLists.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isChecked = function (itemLine) {
            var isChecked = false;
            _.forEach($scope.checkedItemLine, function (item) {
                if (item.trackingNo === itemLine.trackingNo) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkItemLine = function ($event, itemLine) {
            $event.stopPropagation();
            if ($scope.isChecked(itemLine)) {
                _.remove($scope.checkedItemLine, function (item) {
                    return item.trackingNo == itemLine.trackingNo;
                });
            } else {
                $scope.checkedItemLine.push(itemLine);
            }
        };

        $scope.loadContent = function (currentPage) {
            $scope.shipmentDetailView = $scope.shipmentDetailLists.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.shipmentDetailLists.length ? $scope.shipmentDetailLists.length : currentPage * $scope.pageSize);
        };
        $scope.save = function () {
            var trackingNos = _.map($scope.checkedItemLine, 'trackingNo');
            $mdDialog.hide({trackingNos:trackingNos});
        }
        $scope.cancel = function () {
            $mdDialog.hide();
        };
        $scope.search = function ($event) {
            $event.stopPropagation();
            $scope.searching = true;
            if ($scope.searchInfo.trackingNos)
                $scope.shipmentDetailLists = _.filter($scope.orginSource, {
                    trackingNo: $scope.searchInfo.trackingNos
                });
            else {
                $scope.shipmentDetailLists = $scope.orginSource;
            }
            $scope.loadContent(1);
            $scope.searching = false;

        }

        function searchSmallParcelShipmentDetail(param) {
            printService.searchSmallParcelShipmentDetail(param).then(function (response) {
                $scope.orginSource = angular.copy(response);
                $scope.shipmentDetailLists = response;
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function _init() {

            if (trackingNos.length > 0) {
                searchSmallParcelShipmentDetail({
                    trackingNos: trackingNos
                });
            }


        }
        _init();
    };

    controller.$inject = ['$scope', '$resource', '$mdDialog', 'printService', 'lincUtil', 'trackingNos'];

    return controller;
});