define([
    'angular',
    'lodash',
    'src/admin/service/import/excelUpload',
    'src/admin/service/import/fieldMapping'
], function (angular, _, excelUpload, fieldMapping) {
    var addressImportController = function ($scope, $http, $mdDialog, lincUtil, inventoryService) {
        $scope.fields = ["itemSpecId", "sn", "type", "status", "qty",
            "unitId", "lpId", "location", "customerId", "supplierId", "titleId",
            "receiptId", "lotNo", "expirationDate", "shelfLifeDays", "mfgDate"];

        excelUpload($scope, $http, lincUtil);
        fieldMapping($scope, lincUtil);

        $scope.headAutoMapping = function () {
            $scope.fieldMapping = {};
            _.forEach($scope.importUploadFields, function (field) {
                if (field === "Item") {
                    $scope.fieldMapping["itemSpecId"] = "Item";

                } else if (field === "SN") {
                    $scope.fieldMapping["sn"] = "SN";

                } else if (field === "Goods Type") {
                    $scope.fieldMapping["type"] = "Goods Type";

                } else if (field === "Status") {
                    $scope.fieldMapping["status"] = "Status";

                } else if (field === "QTY") {
                    $scope.fieldMapping["qty"] = "QTY";

                } else if (field === "UOM") {
                    $scope.fieldMapping["unitId"] = "UOM";

                } else if (field === "LP") {
                    $scope.fieldMapping["lpId"] = "LP";

                } else if (field === "Location") {
                    $scope.fieldMapping["location"] = "Location";

                } else if (field === "Customer") {
                    $scope.fieldMapping["customerId"] = "Customer";

                } else if (field === "Supplier") {
                    $scope.fieldMapping["supplierId"] = "Supplier";

                } else if (field === "Title") {
                    $scope.fieldMapping["titleId"] = "Title";

                } else if (field === "ReceiptId") {
                    $scope.fieldMapping["receiptId"] = "ReceiptId";

                } else if (field === "Lot No.") {
                    $scope.fieldMapping["lotNo"] = "Lot No.";

                } else if (field === "Expiration Date") {
                    $scope.fieldMapping["expirationDate"] = "Expiration Date";

                } else if (field === "Shelf Life Days") {
                    $scope.fieldMapping["shelfLifeDays"] = "Shelf Life Days";

                } else if (field === "Mfg Date") {
                    $scope.fieldMapping["mfgDate"] = "Mfg Date";

                }
            });
        };

        function fomatDate(data) {
            _.forEach(data, function (item) {
                if (item["type"]) {
                    item["type"] = item["type"].toUpperCase();
                }
                if (item["status"]) {
                    item["status"] = item["status"].toUpperCase();
                    if (item["status"] === "ONHOLD") {
                        item["status"] = "ON_HOLD";
                    }
                }
            });
        }

        $scope.submit = function () {
            var data = $scope.getData();
            if (!data || data.length === 0) {
                lincUtil.errorPopup("No data!");
                return;
            }
            fomatDate(data);

            $scope.loading = true;
            inventoryService.batchCreate({inventories:data}).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
                $scope.importUploadData = [];
                $scope.importUploadDataSimple = [];

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        };
    };

    addressImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'inventoryService'];
    return addressImportController;
});