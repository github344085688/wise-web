'use strict';
define([], function () {
    var controller = function ($scope, $state, $stateParams, lincUtil, isAddAction, 
                               locationService, session, facilityService, lincResourceFactory, inventoryService, lpService) {

        $scope.useDockCheckingNo = false;
        var ctrl = this;
        var oldCheckingNo;
        $scope.locationTypes = ["ZONE", "LOCATION", "PICK", "STAGING", "PARKING", "DOCK", "BASE", "SORTING", "OTHER"];
        $scope.locationSubType = ["PARKING", "EMPTY_CTN", "FULL_CTN", "WAITING", "2D", "3D", "3D_GRID"];
        $scope.locationStatus = ["USEABLE", "DISABLED", "DELETE", "MERGED", "MIXTURE"];
        $scope.supportEquipments =  ["Forklift", "Pallet Jack"];
        $scope.stack =  ["1 high", "2 high", "2 1/2 high", "3 high", "4 high"];
        var originalLocationType;
        function init() {
            getAllLocationGroup();
            getUseDockCheckingNo();
            getZone();

            ctrl.isAddAction = $stateParams.locationId ? false : true;
            if (ctrl.isAddAction) {
                $scope.submitLabel = "Save";
                ctrl.location = {capacity: {}};
             
            } else {
                $scope.submitLabel = "Update";
                locationService.getLocationById($stateParams.locationId).then(function (response) {
                    ctrl.location = response;
                    originalLocationType = response.type;
                    oldCheckingNo = response.checkingNo;
                    if(ctrl.location.dockStatus && ctrl.location.entryId) {
                        if (ctrl.location.dockStatus === "RESERVED") {
                            ctrl.location.reserveEntryId = ctrl.location.entryId;
                        } else if (ctrl.location.dockStatus === "OCCUPIED") {
                            ctrl.location.occupyEntryId = ctrl.location.entryId;
                        }
                    }
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }

        }

        init();

        ctrl.onSelectOrganization = function (org) {
            ctrl.address.organizationName = org.name;
        };

        function createLp(location,  cbFun) {
            lpService.createLpWithLocationId(location.id,'HLP').then(function (response) {
                cbFun(response.id);
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + error.data.error);
            })
        }
        
        function createLocationToSubmit(location) {
            $scope.loading = true;
            locationService.addLocation(location).then(function (response) {
                location.id = response.id;
                if(location.type != "PICK") {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("cf.facility.resource.location.list");
                    });
                    return;
                }
                createLp(location, function (hlpId) {
                    location.hlpId = hlpId;
                    updateLocation(location, false);
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }

        function updateLocationToSubmit(location) {
            if(!location.locationGroupId) {
                location.locationGroupId = null;
            }
            $scope.loading = true;
            if(originalLocationType != location.type && location.type == "PICK") {
                createLp(location, function (hlpId) {
                    location.hlpId = hlpId;
                    updateLocation(location, true);
                });
            }else if(originalLocationType != location.type && originalLocationType == "PICK" && location.hlpId) {
                inventoryService.getInventoryWithLpId(location.hlpId).then(function (response) {
                    if(!response || response.length == 0) {
                        location.hlpId = null;
                        updateLocation(location, true);
                    }else {
                        $scope.loading = false;
                        lincUtil.errorPopup("Failed to update location type, please remove inventory from this pick location.");
                    }
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            }else {
                updateLocation(location, true);
            }
        }

        function updateLocation(location, isUpdateToSubmit) {
            if(!location.stack) {
                location.stack= null;
            }
            locationService.updateLocation(location).then(function () {
                $scope.loading = false;
                if(isUpdateToSubmit) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("cf.facility.resource.location.list");
                    });
                }else {
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("cf.facility.resource.location.list");
                    });
                }

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }

        ctrl.addOrUpdateLocation = function () {
            $scope.loading = true;
            if(ctrl.location.type == "DOCK") {
                ctrl.location.category = "DOCK";
            }else {
                ctrl.location.category = "WAREHOUSE";
            }
            if (ctrl.isAddAction && !ctrl.location.id) {
                createLocationToSubmit(ctrl.location);
            } else {
                updateLocationToSubmit(ctrl.location);
            }
        };

        ctrl.generateBarcode = function (checkingNo) {
            if (!checkingNo) {
                lincUtil.messagePopup("Tip", "Please fill in the checking NO field!");
            }
        };

        ctrl.cancelEditLocation = function () {
            $state.go("cf.facility.resource.location.list");
        };

        ctrl.release = function () {
            lincUtil.deleteConfirmPopup("Are you sure to release this door?", function () {
                locationService.releaseDock(ctrl.location.id, ctrl.location.entryId).then(function () {
                    ctrl.location.reserveEntryId = "";
                    ctrl.location.occupyEntryId = "";
                    ctrl.location.entryId = null;
                    lincUtil.saveSuccessfulPopup();
                }, function(){
                    lincUtil.processErrorResponse(error);
                });
            });

        };


        function getAllLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getUseDockCheckingNo() {
            $scope.facilityId = session.getCompanyFacility().facilityId;
            facilityService.searchFacility({ id: $scope.facilityId }).then(function (response) {
                $scope.useDockCheckingNo = response[0].useDockCheckingNo;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getZone() {
            locationService.getZones().then(function (data) {
                $scope.zones = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function createRandomString() {
            var source = "abcdefghzklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
            var letter = "abcdefghzklmnopqrstuvwxyz";
            var number = "0123456789";
            var mark = "@#$%&";
            function getRandMemberByLength(length, resourse) {
                var randStr = "";
                for (var i = 0; i < length; i++) {
                    randStr += resourse.charAt(Math.ceil(Math.random() * 1000) % resourse.length);
                }
                return randStr;
            }
            var rand = getRandMemberByLength(5, source);
            var randLetter = getRandMemberByLength(1, letter);
            var randNumber = getRandMemberByLength(1, number);
            var randMark = getRandMemberByLength(1, mark);
            return rand + randLetter + randNumber + randMark;
        }

        ctrl.onSelectLocationGroup = function (locationGroup) {
            if(isAddAction && ctrl.location && locationGroup) {
                ctrl.location.supportPickType = locationGroup.supportPickType;
                ctrl.location.supportEquipments = locationGroup.supportEquipments;
            }
        }

        $scope.getPickTypes = function () {
            return lincResourceFactory.getPickTypes().then(function (response) {
                $scope.pickTypes = response;
            });
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction',
        'locationService', 'session', 'facilityService', 'lincResourceFactory', 'inventoryService', 'lpService'];

    return controller;
});
