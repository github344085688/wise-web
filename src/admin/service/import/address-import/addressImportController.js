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
    var addressImportController = function ($scope, $http, $mdDialog, lincUtil, addressService) {
        var tagTypes = ["BILLTO", "SHIPTO", "STORE", "SOLDTO", "PICKFROM"];
        $scope.fields = ["tags", "organizationName", "referenceNo", "toHome", "name",
            "country", "state", "city", "zipCode", "fax", "address1", "address2",
            "batchCode", "contact", "phone", "extension", "email", "storeNo"];

        excelUpload($scope, $http, lincUtil);
        fieldMapping($scope, lincUtil);

        $scope.headAutoMapping = function () {
            $scope.fieldMapping = {};
            _.forEach($scope.importUploadFields, function (field) {
                if (field === "Partner Organization") {
                    $scope.fieldMapping["organizationName"] = "Partner Organization";

                } else if (field === "AddressName") {
                    $scope.fieldMapping["name"] = "AddressName";

                } else if (field === "Tag") {
                    $scope.fieldMapping["tags"] = "Tag";

                } else if (field === "StoreNo") {
                    $scope.fieldMapping["storeNo"] = "StoreNo";

                } else if (field === "ReferenceNo") {
                    $scope.fieldMapping["referenceNo"] = "ReferenceNo";

                } else if (field === "Address1") {
                    $scope.fieldMapping["address1"] = "Address1";

                } else if (field === "Address2") {
                    $scope.fieldMapping["address2"] = "Address2";

                } else if (field === "City") {
                    $scope.fieldMapping["city"] = "City";

                } else if (field === "State") {
                    $scope.fieldMapping["state"] = "State";

                } else if (field === "ZipCode") {
                    $scope.fieldMapping["zipCode"] = "ZipCode";

                } else if (field === "Country") {
                    $scope.fieldMapping["country"] = "Country";

                } else if (field === "Fax") {
                    $scope.fieldMapping["fax"] = "Fax";

                } else if (field === "Contact") {
                    $scope.fieldMapping["contact"] = "Contact";

                } else if (field === "Phone") {
                    $scope.fieldMapping["phone"] = "Phone";

                } else if (field === "Ext") {
                    $scope.fieldMapping["extension"] = "Ext";

                } else if (field === "Email") {
                    $scope.fieldMapping["email"] = "Email";

                }
            });
        };

        function validate(data) {
            _.forEach(data, function (item) {
                if (item["tags"]) {
                    var temp = item["tags"].toUpperCase().split(",");
                    var tags = [];
                    _.forEach(temp, function (tag) {
                        if (!_.includes(tagTypes, tag)) {
                            var mesg = "tag Incorrect! Require value:" + tagTypes.join(",");
                            lincUtil.errorPopup(mesg);
                            throw new Error(mesg);
                        }
                        if (tag === "BILLTO") {
                            tags.push("BillTo");
                        } else if (tag === "SHIPTO") {
                            tags.push("ShipTo");
                        } else if (tag === "STORE") {
                            tags.push("Store");
                        } else if (tag === "SOLDTO") {
                            tags.push("SoldTo");
                        } else if (tag === "PICKFROM") {
                            tags.push("PickFrom");
                        }
                    });
                    item["tags"] = tags;
                } else {
                    item["tags"] = null;
                }
            });
        }

        $scope.submit = function () {
            var data = $scope.getData();
            validate(data);

            $scope.loading = true;
            addressService.addressImport(data).then(function (res) {
                $scope.loading = false;
                if (res != null && res.length > 0) {
                    $scope.addErrorData(res, "address");
                    return;
                }
                lincUtil.saveSuccessfulPopup();

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        };
    };

    addressImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'addressService'];
    return addressImportController;
});