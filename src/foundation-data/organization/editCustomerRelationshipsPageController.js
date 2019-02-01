'use strict';

define([], function () {

    var controller = function ($scope, $state, $stateParams, lincUtil,
        organizationService, organizationRelationshipService, carrierService) {
        var ctrl = this;
        var selectRole;

        ctrl.changeTab = function (role) {
            ctrl.carrierNoteMap = {}
            selectRole = role;
            ctrl.relationshipsRole = role;
            ctrl.partnerId = null;
            ctrl.searchInfo = {};
            customerRelationShip.getRelationshipView();
        };

        ctrl.btnAdd = function () {
            ctrl.partnerId = ctrl.searchInfo.organization;
            if (!ctrl.partnerId) {
                lincUtil.messagePopup("Tip", "Please select an organization before to add");
            } else {
                $scope.addLoading = true;
                customerRelationShip.addRelationship();
                ctrl.partnerId = null;
            }
        };

        ctrl.btnSearch = function () {
            ctrl.partnerId = ctrl.searchInfo.organization;
            $scope.searchLoading = true;
            customerRelationShip.getRelationshipView();
            ctrl.partnerId = null;
        };

        ctrl.btnDel = function (index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                organizationRelationshipService.deleteRelationshipRole($stateParams.organizationId, ctrl.organizatioRelationshipsView[index].basic.id, ctrl.relationshipsRole).then(function () {
                    ctrl.organizatioRelationshipsView.splice(index, 1);
                }, function () {
                    lincUtil.errorPopup("Error Found While Removing");
                });
            });
        };

        var customerRelationShip = {
            init: function () {
                ctrl.organizationTags = ["Customer", "Title", "Supplier", "Brand", "Retailer", "Carrier", "Warehouse", "Tenant"];
                ctrl.organizatioRelationshipsView = [];
                ctrl.changeTab("Title");
            },
            getRelationshipView: function () {

                organizationRelationshipService.searchRelationship({
                    organizationId: $stateParams.organizationId,
                    partnerId: ctrl.partnerId,
                    relationship: ctrl.relationshipsRole
                }).then(function (response) {
                    $scope.searchLoading = false;
                    if (response) {
                        ctrl.organizatioRelationshipsView = response;
                        // console.log(response);
                        if (selectRole === 'Carrier') {
                            getCarrierNoteName(response);
                        }
                    }
                }, function () {
                    $scope.searchLoading = false;
                    ctrl.organizatioRelationshipsView = [{}];
                });
            },
            addRelationship: function () {
                $scope.addLoading = true;
                organizationRelationshipService.createRelationship({
                    organizationId: $stateParams.organizationId,
                    partnerId: ctrl.partnerId,
                    relationships: [ctrl.relationshipsRole]
                }).then(function (res) {
                    $scope.addLoading = false;
                    if (res.error) {
                        lincUtil.messagePopup("Error Found:" + res.error);
                    } else {
                        lincUtil.saveSuccessfulPopup();
                        customerRelationShip.getRelationshipView();
                    }

                }, function () {
                    $scope.addLoading = false;
                    lincUtil.messagePopup("Error Found");
                });
            }
        };
        function getCarrierNoteName(data) {
            var carrierIds = _.map(_.map(data, 'basic'), 'id');
            carrierService.searchCarrier({ ids: carrierIds }).then(function (response) {
                response.forEach(function (CarrierItem) {
                    ctrl.carrierNoteMap[CarrierItem.basic.id] = CarrierItem.note ? CarrierItem.note : "";
                });
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }
        customerRelationShip.init();

        ctrl.cancelEditOrganization = function () {
            $state.go("fd.organization.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'organizationService', 'organizationRelationshipService', 'carrierService'];

    return controller;
});
