/**
 * Created by Giroux on 2017/7/24.
 */

'use strict';

define([
    'angular',
    'lodash',
    'src/admin/service/import/excelUpload',
    'src/admin/service/import/fieldMapping'
], function (angular, _, excelUpload, fieldMapping) {
    var longhaulImportController = function ($scope, $http, $mdDialog, lincUtil, locationService) {
        var locationType = ["ZONE", "LOCATION", "STAGING", "PARKING", "DOCK", "BASE", "SPOT","SORTING"];
        var locationSubType = ["PARKING", "EMPTY_CTN", "FULL_CTN", "WAITING", "2D", "3D", "3D_GRID"];
        var locationCategory = ["YARD", "WAREHOUSE", "DOCK"];
        var pickType = ["BULK PICK", "PALLET PICK", "PIECE PICK", "CASE PICK"];
        var status = ["USEABLE", "DISABLED", "DELETE", "MERGED", "MIXTURE"];

        $scope.fields = ["name", "type", "checkingNo", "subType", "category", "supportPickType", "tenantId", "parentName", "locationGroupId", "sequence", "status", "pickStrategyWeight"];

        excelUpload($scope, $http, lincUtil);
        fieldMapping($scope, lincUtil);

        $scope.headAutoMapping = function () {
            $scope.fieldMapping = {};
            _.forEach($scope.importUploadFields, function (field) {
                if (field === "name") {
                    $scope.fieldMapping["name"] = "name";

                } else if (field === "type") {
                    $scope.fieldMapping["type"] = "type";

                } else if (field === "checkingNo") {
                    $scope.fieldMapping["checkingNo"] = "checkingNo";

                } else if (field === "subType") {
                    $scope.fieldMapping["subType"] = "subType";

                } else if (field === "category") {
                    $scope.fieldMapping["category"] = "category";

                } else if (field === "supportPickType") {
                    $scope.fieldMapping["supportPickType"] = "supportPickType";

                } else if (field === "tenantId") {
                    $scope.fieldMapping["tenantId"] = "tenantId";

                } else if (field === "parentName") {
                    $scope.fieldMapping["parentName"] = "parentName";

                } else if (field === "locationGroupId") {
                    $scope.fieldMapping["locationGroupId"] = "locationGroupId";

                } else if (field === "sequence") {
                    $scope.fieldMapping["sequence"] = "sequence";

                } else if (field === "status") {
                    $scope.fieldMapping["status"] = "status";

                } else if (field === "strategyWeight") {
                    $scope.fieldMapping["pickStrategyWeight"] = "strategyWeight";

                }
            });
        };

        function validate(data) {
            _.forEach(data, function (item) {
                if (item["type"]) {
                    var temp = item["type"].toUpperCase();

                    if (!_.includes(locationType, temp)) {
                        var mesg = "Type Incorrect! Require value:" + locationType.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    item["type"] = temp;
                }
                if (item["subType"]) {
                    var temp = item["subType"].toUpperCase();

                    if (!_.includes(locationSubType, temp)) {
                        var mesg = "SubType Incorrect! Require value:" + locationSubType.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    item["subType"] = temp;
                }
                if (item["status"]) {
                    var temp = item["status"].toUpperCase();

                    if (!_.includes(status, temp)) {
                        var mesg = "SubType Incorrect! Require value:" + status.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    item["status"] = temp;
                }
                if (item["category"]) {
                    var temp = item["category"].toUpperCase();

                    if (!_.includes(locationCategory, temp)) {
                        var mesg = "Category Incorrect! Require value:" + locationCategory.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    item["category"] = temp;
                }
                if (item["supportPickType"]) {
                    var temp = item["supportPickType"].toUpperCase();

                    if (!_.includes(pickType, temp)) {
                        var mesg = "SupportPickType Incorrect! Require value:" + pickType.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    if (temp === "BULK PICK") {
                        item["supportPickType"] = "Bulk Pick";

                    } else if (temp === "PALLET PICK") {
                        item["supportPickType"] = "Pallet Pick";

                    } else if (temp === "PIECE PICK") {
                        item["supportPickType"] = "Piece Pick";

                    } else if (temp === "CASE PICK") {
                        item["supportPickType"] = "Case Pick";

                    }
                }
            });
        }

        $scope.submit = function () {
            var data = $scope.getData();
            validate(data);

            $scope.loading = true;
            locationService.batchAddLocation(data).then(function (res) {
                $scope.loading = false;
                if (res != null && res.length > 0) {
                    $scope.addErrorData(res, "location");
                    return;
                }
                lincUtil.saveSuccessfulPopup();

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        };
    };

    longhaulImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'locationService'];
    return longhaulImportController;
});