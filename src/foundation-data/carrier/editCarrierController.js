'use strict';

define(["angular"], function(angular) {

    var controller = function($scope, $state, $stateParams, lincUtil,
                              isAddAction, carrierService, organizationService) {

        $scope.shippingMethods = ['Truckload', 'LTL', 'Small Parcel', 'Will Call'];

        function init() {
            $scope.isAddAction = isAddAction;
            if(!isAddAction) {
                carrierService.getCarrierByOrgId($stateParams.carrierId).then(function(response) {
                    $scope.carrier = response;
                    $scope.submitLabel = "Update";
                }, function() {});
            }else {
                $scope.submitLabel = "Save";
                $scope.carrier = {};
            }
        }
        init();

        function getCarrierBySCAC(scac) {
            var param = {
                scacEq: scac
            };
            return carrierService.searchCarrier(param)
        }

        $scope.addOrUpdateCarrier = function() {
            if($scope.carrier.defaultShippingMethod===undefined){
                $scope.carrier.defaultShippingMethod=null;
            }
            var carrier = angular.copy($scope.carrier);
            getCarrierBySCAC(carrier.scac).then(function (carriers) {
                if(!$stateParams.carrierId) {
                    if (carriers.length > 0) {
                        lincUtil.errorPopup('Error: scac ' + carrier.scac + " is already used by carrier " + carriers[0].name);
                        return;
                    }
                    $scope.loading = true;

                    organizationService.createOrganization({basic: carrier.basic, extend:{channel:'MANUAL'}}).then(function (res) {
                        delete carrier.basic;
                        updateCarrier(res.id, carrier);
                    },accessServiceFail);
                }else {
                    var self = _.filter(carriers, function(o) {
                        return o.id === carrier.id;
                    });
                    if (carriers.length > 0 && !self) {
                        lincUtil.errorPopup('Error: scac ' + carrier.scac + " is already used by carrier " + carriers[0].name);
                        return;
                    }
                    $scope.loading = true;
                    updateCarrier(carrier.id, carrier);
                }
            });
        };

        function updateCarrier(organizationId, carrier) {
            carrierService.createAndUpdateCarrier(organizationId, carrier).then(function(res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go("fd.carrier.list");
                });
            },accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        $scope.cancelEditOrganization = function() {
            $state.go("fd.carrier.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'isAddAction', 'carrierService', 'organizationService'];

    return controller;
});
