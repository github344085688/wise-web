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
    var organizationImportController = function ($scope, $http, $mdDialog, lincUtil, organizationService) {
        var relationships = ["CARRIER", "FACILITY", "COMPANY", "CUSTOMER", "RETAILER", "TITLE", "SUPPLIER", "BRAND", "TENANT"];
        $scope.fields = ["customerName", "partnerName", "partnerNote", "relation",
            "partnerContact", "partnerContactPhone", "partnerContactEmail", "partnerContactType",
            "partnerAkaReferenceId", "partnerAkaReferenceName"
        ];

        excelUpload($scope, $http, lincUtil);
        fieldMapping($scope, lincUtil);

        $scope.headAutoMapping = function () {
            $scope.fieldMapping = {};
            _.forEach($scope.importUploadFields, function (field) {
                if (field === "Customer") {
                    $scope.fieldMapping["customerName"] = "Customer";

                } else if (field === "Partner Organization") {
                    $scope.fieldMapping["partnerName"] = "Partner Organization";

                } else if (field === "Partner Organization Description") {
                    $scope.fieldMapping["partnerNote"] = "Partner Organization Description";

                } else if (field === "Relations") {
                    $scope.fieldMapping["relation"] = "Relations";

                } else if (field === "Partner Organization Contact") {
                    $scope.fieldMapping["partnerContact"] = "Partner Organization Contact";

                } else if (field === "Partner Organization Phone") {
                    $scope.fieldMapping["partnerContactPhone"] = "Partner Organization Phone";

                } else if (field === "Partner Organization Email") {
                    $scope.fieldMapping["partnerContactEmail"] = "Partner Organization Email";

                } else if (field === "Partner Organization ID") {
                    $scope.fieldMapping["partnerAkaReferenceId"] = "Partner Organization ID";

                }

            });
        };

        function validate(data) {
            _.forEach(data, function (item) {
                if (item["relation"]) {
                    item["relation"] = item["relation"].toUpperCase();
                    if (!_.includes(relationships, item["relation"])) {
                        var mesg = "Relationships Incorrect! Require value:" + relationships.join(",");
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }

                    if (item["relation"] === "CARRIER") {
                        item["relation"] = "Carrier";
                    } else if (item["relation"] === "FACILITY") {
                        item["relation"] = "Facility";
                    } else if (item["relation"] === "COMPANY") {
                        item["relation"] = "Company";
                    } else if (item["relation"] === "CUSTOMER") {
                        item["relation"] = "Customer";
                    } else if (item["relation"] === "RETAILER") {
                        item["relation"] = "Retailer";
                    } else if (item["relation"] === "TITLE") {
                        item["relation"] = "Title";
                    } else if (item["relation"] === "SUPPLIER") {
                        item["relation"] = "Supplier";
                    } else if (item["relation"] === "BRAND") {
                        item["relation"] = "Brand";
                    } else if (item["relation"] === "TENANT") {
                        item["relation"] = "Tenant";
                    }
                }
            });
        }

        function dataFormat(data) {
            var orgs = [];

            _.forEach(data, function (item) {
                var org = {};
                org.customerName = item.customerName;
                org.partnerName = item.partnerName;
                org.partnerNote = item.partnerNote;
                org.relation = item.relation;
                if (item.partnerContact || item.partnerContactPhone || item.partnerContactType) {
                    org.partnerContact = {};
                    org.partnerContact.name = item.partnerContact;
                    org.partnerContact.phone = item.partnerContactPhone;
                    org.partnerContact.email = item.partnerContactEmail;
                    org.partnerContact.type = item.partnerContactType;
                }

                if (item.partnerAkaReferenceId || item.partnerAkaReferenceName) {
                    var aka = {};
                    aka.orgId = "ORG-0";
                    aka.items = [];
                    var akaItem = {};
                    akaItem.referenceId = item.partnerAkaReferenceId;
                    akaItem.referenceName = item.partnerAkaReferenceName;
                    aka.items.push(akaItem);
                    org.aka = aka;
                }

                orgs.push(org);
            });
            return orgs;
        }

        $scope.submit = function () {
            var data = $scope.getData();
            validate(data);

            var orgs = dataFormat(data);

            $scope.loading = true;
            organizationService.organizationImport(orgs).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        };
    };

    organizationImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'organizationService'];
    return organizationImportController;
});