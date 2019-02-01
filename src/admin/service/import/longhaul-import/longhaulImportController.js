/**
 * Created by Giroux on 2017/7/5.
 */

'use strict';

define([
    'angular',
    'lodash',
    'src/admin/service/import/excelUpload',
    'src/admin/service/import/fieldMapping'
], function (angular, _, excelUpload, fieldMapping) {
    var longhaulImportController = function ($scope, $http, $mdDialog, lincUtil, longHaulService) {
        var shipDay = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
        $scope.fields = ["customerName", "longHaulNo", "description", "longHaulShipDay",
            "retailerName", "addressStoreNo", "sequence", "scheduleTime"];

        excelUpload($scope, $http, lincUtil);
        fieldMapping($scope, lincUtil);

        $scope.headAutoMapping = function () {
            $scope.fieldMapping = {};
            _.forEach($scope.importUploadFields, function (field) {
                if (field === "Customer") {
                    $scope.fieldMapping["customerName"] = "Customer";

                } else if (field === "LongHaul#") {
                    $scope.fieldMapping["longHaulNo"] = "LongHaul#";

                } else if (field === "LongHaulDescription") {
                    $scope.fieldMapping["description"] = "LongHaulDescription";

                } else if (field === "LongHaulShipDay") {
                    $scope.fieldMapping["longHaulShipDay"] = "LongHaulShipDay";

                } else if (field === "LongHaul Sequence") {
                    $scope.fieldMapping["sequence"] = "LongHaul Sequence";

                } else if (field === "AddressStoreNo") {
                    $scope.fieldMapping["addressStoreNo"] = "AddressStoreNo";

                } else if (field === "Retailer") {
                    $scope.fieldMapping["retailerName"] = "Retailer";

                } else if (field === "Schedule Time") {
                    $scope.fieldMapping["scheduleTime"] = "Schedule Time";

                }
            });
        };

        function validate(data) {
            _.forEach(data, function (item) {
                if (item["longHaulShipDay"]) {
                    var temp = item["longHaulShipDay"].toUpperCase();

                    if (!_.includes(shipDay, temp)) {
                        var mesg = "ShipDay Incorrect! Require value:" + shipDay.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    if (temp === "MONDAY") {
                        item["longHaulShipDay"] = "Monday";

                    } else if (temp === "TUESDAY") {
                        item["longHaulShipDay"] = "Tuesday";

                    } else if (temp === "WEDNESDAY") {
                        item["longHaulShipDay"] = "Wednesday";

                    } else if (temp === "THURSDAY") {
                        item["longHaulShipDay"] = "Thursday";

                    } else if (temp === "FRIDAY") {
                        item["longHaulShipDay"] = "Friday";

                    } else if (temp === "SATURDAY") {
                        item["longHaulShipDay"] = "Saturday";

                    } else if (temp === "SUNDAY") {
                        item["longHaulShipDay"] = "Sunday";

                    }
                }
            });
        }

        function getStop(data) {
            var stop = {};
            stop.retailerId = "ORG-0";
            stop.retailerName = data.retailerName;
            stop.addressStoreNo = data.addressStoreNo;
            stop.sequence = data.sequence;
            stop.scheduleTime = data.scheduleTime;
            return stop;
        }
        function dataFormat(data) {
            var longHauls = [];
            _.forEach(data, function (item) {
                var index = _.findIndex(longHauls, function (lh) {
                    return lh.customerName === item.customerName &&
                        lh.longHaulNo === item.longHaulNo;
                });
                if (index >= 0) {
                    if (item.description && longHauls[index].description !== item.description) {
                        longHauls[index].description = item.description;
                    }
                    if (item.longHaulShipDay && !_.includes(longHauls[index].longHaulShipDay, item.longHaulShipDay)) {
                        longHauls[index].longHaulShipDay.push(item.longHaulShipDay);
                    }
                    longHauls[index].stops.push(getStop(item));

                } else {
                    var longHaul = {};
                    longHaul.customerId = "ORG-0";
                    longHaul.customerName = item.customerName;
                    longHaul.longHaulNo = item.longHaulNo;
                    longHaul.description = item.description;
                    longHaul.longHaulShipDay = [];
                    if (item.longHaulShipDay) {
                        longHaul.longHaulShipDay.push(item.longHaulShipDay);
                    }
                    longHaul.stops = [];
                    longHaul.stops.push(getStop(item));
                    longHauls.push(longHaul);
                }
            });
            return longHauls;
        }

        function getErrorUploadData(data) {
            var errorData = [];
            _.forEach(data, function (item) {
                var error = _.find($scope.importUploadData, function (lh) {
                    return $scope.getMappedValue(lh, "customerName") === item.longHaul.customerName &&
                        $scope.getMappedValue(lh, "longHaulNo") === item.longHaul.longHaulNo;
                });
                if (error) {
                    error.errorMesg = item.errorMesg;
                    errorData.push(error);
                }
            });
            $scope.importUploadData = errorData;

            if (!_.includes($scope.importUploadFields, "errorMesg")) {
                $scope.importUploadFields.push("errorMesg");
            }
            $scope.loadContent();
            lincUtil.errorPopup("There are " + data.length + " data import fail, you can see the error message in Upload Data List!");
        }

        $scope.submit = function () {
            var data = $scope.getData();
            validate(data);
            var longHauls = dataFormat(data);

            $scope.loading = true;
            longHaulService.longHaulImport(longHauls).then(function (res) {
                $scope.loading = false;
                if (res != null && res.length > 0) {
                    getErrorUploadData(res);
                    return;
                }
                lincUtil.saveSuccessfulPopup();

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        };
    };

    longhaulImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'longHaulService'];
    return longhaulImportController;
});