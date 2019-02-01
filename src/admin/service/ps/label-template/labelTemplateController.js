'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincUtil, session,organizationRelationshipService) {
        $scope.submit = function () {
            var labelTemplate = angular.copy($scope.labelTemplate);
            $scope.loading = true;
            var promise;
            if (labelTemplate.id) {
                promise = update(labelTemplate);
            } else {
                promise = insert(labelTemplate);
            }
            promise.then(function (data) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
                search({});
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function search(param) {
            $resource("/bam/print-app/label-template/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise.then(function (response) {
                $scope.labelTemplates = response;
            });
        }

        function insert(labelTemplate) {
            var promise = $resource("/print-app/label-template").save(labelTemplate).$promise;
            return promise;
        }

        $scope.delete = function (id) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                $resource("/print-app/label-template/:id").delete({id: id}).then(function (response) {
                    _.remove($scope.labelTemplates, function (labelTemplate) {
                        return labelTemplate.id === id;
                    });
                });
            });
        };

        $scope.reset = function () {
            $scope.labelTemplate = {};
        };

        function update(labelTemplate) {
            var promise = $resource("/print-app/label-template/:id", null, {'update': {method: 'PUT'}}).update({id: labelTemplate.id}, labelTemplate).$promise;
            return promise;
        }

        $scope.toUpdate = function (labelTemplate) {
            $scope.labelTemplate = angular.copy(labelTemplate);
            $scope.update = true;
        };

        $scope.clone = function (labelTemplate) {
            labelTemplate.id = null;
            $scope.labelTemplate = labelTemplate;
        }

        function _init() {
            $scope.labelTemplate = {};
            search({});
            $scope.labelTypes = ['Packing List', 'Shipping Label', 'Packaging Ticket', 'Pallet Label', 'Carton Label', 'UCC Label',
                'Receiving Plate', 'Pick Ticket', "Master Loading Ticket", "Entry Label", "Item Spec Label",
                "LP Label", "Equipment Label", "SN Label", "Inventory LP"];
            $scope.labelFields = ['CUSTOMER', 'SHIP FROM ADDR', 'FROM CSZ', 'CARRIER', 'PRO NO', 'PALLET SEQ',
                'PALLET TOTAL', 'NO. OF CARTONS', 'ORDER NO', 'SHIPMENT TICKET NO', 'ORDER SHIPMENT',
                'BOL NO', 'STORE NO', 'SHIP TO NAME', 'SHIP TO ADDR1', 'SHIP TO ADDR2', 'SHIP TO CSZ', 'SSCC CODE', 'SLP NO', 'TASK PO', 'TASK TOTAL PALLET'];
            $scope.update = false;
            var assignedCompanyFacilities = session.getCompanyFacility();
            $scope.companyId = assignedCompanyFacilities.companyId;
            onSelectSearchCompany();
        }

        function onSelectSearchCompany () {
            organizationRelationshipService.searchRelationship({
                organizationId: $scope.companyId,
                relationship: "Facility", scenario: "ORGANIZATION_ONLY_THE_BASIC"
            }).then(function (response) {
                $scope.facilities = lincUtil.extractOrganizationBasicField(response);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        $scope.selectFacility = function(facilityName){
                if(!facilityName){
                    $scope.labelTemplate.facility = null;
                }
        }

        _init();

    };
    controller.$inject = ['$scope', '$resource', 'lincUtil', 'session','organizationRelationshipService'];
    return controller;
});
