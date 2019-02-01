'use strict';

define(['lodash', './addCarrierController'], function (_, addCarrierController) {
    var carrierInfoController = function ($scope, $state, $stateParams, entryService, organizationService, carrierService, lincUtil, $timeout) {
        $scope.continue = function () {
            if ($scope.isCheckedOut()) {
                $scope.$parent.carrierInfoClass = "done";
                $scope.$parent.activityClass = "active";
                $state.go('cf.facility.windowCheckin.checkinProcess.activity', {entryId: $stateParams.entryId});
            } else {
                tagsInputToArray();
                if (!validation()) {
                    return;
                }
                $scope.continueLoading = true;
                _save().then(function (response) {
                    $scope.continueLoading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    $scope.$parent.carrierInfoClass = "done";
                    $scope.$parent.activityClass = "active";
                    $state.go('cf.facility.windowCheckin.checkinProcess.activity', {entryId: $stateParams.entryId});
                }, function (error) {
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        function tagsInputToArray() {
            $scope.carrierInfo.containerNOs = [];
            $scope.carrierInfo.trailers = [];
            if ("Tractor + Container" === $scope.carrierInfo.equipmentType) {
                _.assign($scope.carrierInfo.containerNOs, _.mapValues($scope.containerNOs, 'text'));
            }
            if ("Tractor + Trailer" === $scope.carrierInfo.equipmentType) {
                _.assign($scope.carrierInfo.trailers, _.mapValues($scope.trailers, 'text'));
            }
        
            
        }

        var _save = function () {
            if (!$stateParams.entryId || $stateParams.entryId === "") {
                lincUtil.errorPopup("Please select an entry !!!", function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }
            $scope.carrierInfo.checkType = "Checkin";
            return entryService.saveCheckinCarrierInfo($stateParams.entryId, $scope.carrierInfo);
        };

        $scope.save = function () {
            tagsInputToArray();
            if (!validation()) {
                return;
            }
            $scope.saveLoading = true;
            return _save().then(function (response) {
                $scope.saveLoading = false;
                if (response.error) {
                    lincUtil.errorPopup("Error Found:" + response.error);
                    return;
                }
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.saveLoading = false;
                lincUtil.processErrorResponse(error);
            });
        };


        function validation() {

            if ("Tractor + Container" === $scope.carrierInfo.equipmentType) {
                if (validateContainerNo()) {
                    $scope.containerNoInvalid = false;
                    return true;
                } else {
                    $scope.containerNoInvalid = true;
                    return false;
                }
            }
            if ("Tractor + Trailer" === $scope.carrierInfo.equipmentType) {
                if (validateTrailerNo()) {
                    $scope.trailerInvalid = false;
                    return true;
                } else {
                    $scope.trailerInvalid = true;
                    return false;
                }
            }
            return $scope.carrierInfo.equipmentType;
        }

        function validateTrailerNo() {
            return !!($scope.carrierInfo.trailers && $scope.carrierInfo.trailers.length > 0);

        }

        function validateContainerNo() {
            if ($scope.carrierInfo.containerNOs && $scope.carrierInfo.containerNOs.length > 0) {
                var isValid = true;
                for (var i in $scope.carrierInfo.containerNOs) {
                    var containerNo = $scope.carrierInfo.containerNOs[i];
                    if (containerNo.length === 10) {
                        var num = getContainerNOVerificationCode(containerNo);
                        if (num === -1) {
                            isValid = false;
                            return;
                        }
                        containerNo = containerNo + num;
                        $scope.carrierInfo.containerNOs[i] = containerNo;
                    }

                    isValid = verifyContainerNO(containerNo);
                }
                return isValid;
            }
            return false;
        }

        function getContainerNOVerificationCode(containerNo) {
            var charCode = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ";
            var reg = new RegExp(/[A-Za-z]{3}[Uu]\d{6}[0-9]?$/g);
            if (!reg.test(containerNo)) return -1;
            var num = 0;
            containerNo = containerNo.toUpperCase();
            for (var i = 0; i < 10; i++) {
                var index = charCode.indexOf(containerNo[i]);
                if (index == -1 || charCode[index] == '?') {
                    return false;
                }
                index = index * Math.pow(2, i);
                num += index;
            }
            num = (num % 11) % 10;
            return num;
        }

        function verifyContainerNO(containerNo) {
            var num = getContainerNOVerificationCode(containerNo);
            return parseInt(containerNo[10]) === num;
        }

        $scope.selectEquipmentType = function () {
            $scope.containerNoShow = false;
            $scope.trailerNoShow = false;
            if ("Tractor + Container" === $scope.carrierInfo.equipmentType) {
                $scope.containerNoShow = true;
            }
            if ("Tractor + Trailer" === $scope.carrierInfo.equipmentType) {
                $scope.trailerNoShow = true;
            }
        };

        $scope.isCheckedOut = function () {
            if ($scope.entry)
                return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
        };

        $scope.loadOrReceive = function () {
            if ($scope.entry) {
                if (_.indexOf($scope.entry.checkInTypes, "Load") > -1 || _.indexOf($scope.entry.checkInTypes, "Delivery") > -1) {
                    return true;
                }
            }
            return false;
        };

        $scope.addCarrier = function () {
            var templateUrl = 'company-facility/facility/window-checkin/checkin-process/template/addCarrier.html';
            lincUtil.popupBodyPage(addCarrierController, templateUrl, null, {mcDot: $scope.carrierInfo.mcDot}).then(function (carrier) {
                if (!carrier.carrierName || "" === _.trim(carrier.carrierName)) {
                    return;
                }

                $scope.carrierInfo.mcDot = carrier.mcDot;
                var organization = {
                    basic: {name: carrier.carrierName},
                    extend: {
                        note: "this is add by window checkin",
                        channel:'MANUAL'
                    }
                };
                organizationService.createOrganization(organization).then(function (response) {
                    if (response.id) {
                        $scope.carrierInfo.carrierId = response.id;
                        var c = {
                            id: response.id,
                            mcDot: carrier.mcDot
                        };
                        carrierService.createAndUpdateCarrier(c.id, c).then(function (res) {
                            var carrierOrg = {
                                id: response.id,
                                name: carrier.carrierName
                            };
                            $scope.availableCarriers.push(carrierOrg);
                            lincUtil.messagePopup("Add Carrier", "Carrier has been added successfully");
                        }, function (error) {
                            lincUtil.processErrorResponse(error);
                        });
                    }
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.searchAvailableCarriers = function (searchName) {
            var param = {relationship: 'Carrier', nameRegex: searchName, scenario: 'Auto Complete'};
            organizationService.getOrganizationByTag(param).then(function (response) {
                $scope.availableCarriers = lincUtil.extractOrganizationBasicField(response);
            });
        };

        $scope.carrierSelect = function (carrier) {
            if (!carrier || !carrier.id) {
                return;
            }
            organizationService.getCarrierByOrganizationId(carrier.id).then(function (response) {
                if (response.mcDot) {
                    $scope.carrierInfo.mcDot = response.mcDot;
                } else {
                    $scope.carrierInfo.mcDot = "";
                }
            });
        };

        $scope.mcDotInput = function (mcDot) {
            if (!mcDot || mcDot.length < 2) {
                return;
            }
            $scope.isSearchCarrier = true;
            entryService.getCarrierByMcDot(mcDot).then(function (response) {
                var org = response.basic;
                if (org.id) {
                    $scope.carrierInfo.carrierId = org.id;
                    $scope.availableCarriers.push(org);
                    $scope.isSearchCarrier = false;
                }
            }, function (error) {
                $scope.isSearchCarrier = false;
                lincUtil.errorPopup("Can't find carrier by mcDot : " + mcDot);
            });
        };

        function _init() {
            entryService.getCarrierInfoByEntryId($stateParams.entryId).then(function (response) {
                $scope.carrierInfo = response;
                $scope.containerNOs = $scope.carrierInfo.containerNOs;
                $scope.trailers = $scope.carrierInfo.trailers;
                $scope.availableCarriers = [];
                $timeout(function () {
                    $scope.availableCarriers.push($scope.carrierInfo.carrier.basic);
                }, 500);

                $scope.selectEquipmentType();
            }, function () {
                $scope.carrierInfo = {};
                $scope.searchAvailableCarriers();
            });
            entryService.getEntryByEntryId($stateParams.entryId).then(function (response) {
                $scope.entry = response;
            });
            entryService.getEquipmentType().then(function (response) {
                $scope.enquipmentTypes = response;
            });
            $scope.containerNoInvalid = false;
            $scope.trailerInvalid = false;
        }

        _init();

    };


    carrierInfoController.$inject = ['$scope', '$state', '$stateParams', 'entryService', 'organizationService', 'carrierService', 'lincUtil', '$timeout'];
    return carrierInfoController;

});
