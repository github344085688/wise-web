'use strict';

define(["angular", 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, lincUtil, taskService, printService,
        isAddAction, facilityService, addressService, userRoleService, userService, userTagService, session,androidFunctionPasswordService) {
        function init() {
            $scope.isAddAction = isAddAction;
            $scope.androidFunctionPassword=[];
            if (!isAddAction) {
                $scope.submitLabel = "Update";
                facilityService.getFacilityByOrgId($stateParams.facilityId).then(function (response) {
                    $scope.facility = response;
                    $scope.facility.userInactiveMinutes = $scope.facility.userInactiveMinutes ? $scope.facility.userInactiveMinutes : "60";
                    $scope.facility.userTaskCapacity = $scope.facility.userTaskCapacity ? $scope.facility.userTaskCapacity : "3";
                    if (!$scope.facility.taskAutoAssignment) {
                        $scope.facility.taskAutoAssignment = {};
                    }
                    if (!$scope.facility.taskAutoAssignment.defaultTaskAssignments) {
                        $scope.facility.taskAutoAssignment.defaultTaskAssignments = [{}];
                    }
                    searchAvailablePrinters($scope.facility.basic.name);
                }, function (){});
            } else {
                $scope.submitLabel = "Save";
                $scope.facility = {};
                $scope.facility.userInactiveMinutes = "60";
                $scope.facility.userTaskCapacity = "3";
                $scope.zplPrinters = [];
                $scope.pdfrinters = [];
            }
            initSetAddress($stateParams.facilityId);
            getActivatedFacility($stateParams.facilityId);
            searchAndroidFunctionPassword({facilityId : $stateParams.facilityId});
        }

        function searchAndroidFunctionPassword(param) {
            androidFunctionPasswordService.searchAndroidFunctionPassword(param).then(function (response) {
                $scope.androidFunctionPassword = response;
                $scope.oldAndroidFunctionPassword = angular.copy(response);
            });
        }

        function getActivatedFacility(customerId) {
            facilityService.getActivatedFacility(customerId).then(function (response) {
                $scope.activeCustomers=response.activeCustomers;
            },function(){

                $scope.activeCustomers=null;
            });

        }

        function searchAvailablePrinters(facilityName) {
            var param = {warehouseId: facilityName};
            printService.searchAvailablePrinters(param).then(function (printers) {
                $scope.zplPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'ZPL';
                });
                $scope.pdfrinters = _.filter(printers, function (printer) {
                    return printer.type === 'PDF';
                });
            });
        }

        function initSetAddress(facilityId) {
            addressService.searchAddress({ organizationId: facilityId , "wiseCompanyId": "across_all_companies"  }).then(function (response) {
                if (response && response.length > 0) {
                    $scope.address = response[0];
                } else {
                    $scope.address = {};
                }
            });
        }

        init();

        $scope.updateFacility = function () {
            $scope.loading = true;
            facilityService.createAndUpdateFacility($scope.facility.id, $scope.facility).then(function (res) {
                updateSessionFacility($scope.facility);
                saveAddress($scope.facility.id);
                addAndroidFunctionPassword($scope.androidFunctionPassword,$scope.oldAndroidFunctionPassword);
            }, accessServiceFail);
        };

        function addAndroidFunctionPassword(androidFunctionPassword, oldAndroidFunctionPassword) {
            if (_.isEqual(androidFunctionPassword, oldAndroidFunctionPassword)) {
                return false;
            }
            var createAndroidFunctionPassword = _.filter(androidFunctionPassword, {'id': null});
            var DeleteAndroidFunctionPassword = _.map(_.differenceBy(oldAndroidFunctionPassword, _.filter(androidFunctionPassword, 'id'), 'id'), 'id');
            var updateAndroidFunctionPassword = _.differenceWith(_.filter(androidFunctionPassword, 'id'), oldAndroidFunctionPassword, _.isEqual);
            if (createAndroidFunctionPassword.length > 0) {
                androidFunctionPasswordServer(androidFunctionPasswordService.createAndroidFunctionPassword(createAndroidFunctionPassword));
            }
            if (DeleteAndroidFunctionPassword.length > 0) {
                androidFunctionPasswordServer(androidFunctionPasswordService.deleteAndroidFunctionPassword(DeleteAndroidFunctionPassword));
            }
            if (updateAndroidFunctionPassword.length > 0) {
                androidFunctionPasswordServer(androidFunctionPasswordService.updateAndroidFunctionPassword(updateAndroidFunctionPassword));
            }
        }

        function androidFunctionPasswordServer(typeServer) {
            $scope.loading = true;
            typeServer.then(accessServiceFail);
        }

        function updateSessionFacility(facility) {
            var currentCompanyFacility = session.getCompanyFacility();
            var assignedCompanyFacilities = session.getAssignedCompanyFacilities();
            if(currentCompanyFacility.facilityId == facility.id) {
                currentCompanyFacility.facility.defaultPDFPrinter = facility.defaultPDFPrinter;
                currentCompanyFacility.facility.defaultZPLPrinter = facility.defaultZPLPrinter;
            }
            _.forEach(assignedCompanyFacilities, function (companyFacility) {
                if(companyFacility.facilityId == facility.id) {
                    companyFacility.facility.defaultPDFPrinter = facility.defaultPDFPrinter;
                    companyFacility.facility.defaultZPLPrinter = facility.defaultZPLPrinter;
                }
            });
            session.setCompanyFacility(currentCompanyFacility);
            session.setAssignedCompanyFacilities(assignedCompanyFacilities);
        }

        function saveAddress(facilityId) {
            var address = angular.copy($scope.address);
            if (!address.name) {
                address.name = $scope.facility.basic.name;
            }
            address["wiseCompanyId"] = "across_all_companies" ;
            if (address.id) {
                addressService.updateAddress(address).then(accessServiceSuccess, accessServiceFail);
            } else {
                address.organizationId = facilityId;
                address.channel = 'MANUAL';
                addressService.addAddress(address).then(accessServiceSuccess, accessServiceFail);
            }
        }

        function accessServiceSuccess() {
            $scope.loading = false;
            lincUtil.saveSuccessfulPopup(function () {
                $state.go("cf.facility.facility-management.list");
            });
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        $scope.cancelEditFacility = function () {
            $state.go("cf.facility.facility-management.list");
        };

        $scope.getTags = function () {
            return userTagService.queryAll().then(function (response) {
                $scope.tags = response;
            });
        };

        $scope.getRoles = function () {
            return userRoleService.queryAll().then(function (response) {
                $scope.roles = response;
            });
        };

        $scope.getUsers = function (keyword) {
            return userService.autoCompleteQuery(keyword).then(function (data) {
                $scope.userList = data;
            });
        };

        $scope.getUserName = function (user) {
            if (!user) return "";
            if (user.firstName && user.lastName) {
                return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
            }
            return user.username;
        };

        $scope.getTaskTypes = function () {
            return taskService.getTaskTypes().then(function (response) {
                $scope.taskTypes = response;
            });
        };

        $scope.addTaskAssignee = function () {
            $scope.facility.taskAutoAssignment.defaultTaskAssignments.push({});
        };

        $scope.removeTaskAssignee = function (index) {
            $scope.facility.taskAutoAssignment.defaultTaskAssignments.splice(index, 1);
        };

        $scope.useDockCheckingNoChange = function (value) {
            if (!value) {
                $scope.facility.requireScanCheckDigitForPickLocation = false;
            }
        };
        $scope.addAndroidFunctionPassword = function () {
            $scope.androidFunctionPassword .push({
                id:null,
                functionName:'',
                password:'',
                facilityId:$scope.facility.id

            });
        };

        $scope.removeAndroidFunctionPassword = function (index) {
            $scope.androidFunctionPassword.splice(index,1);
        };
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'taskService', 'printService',
        'isAddAction', 'facilityService', 'addressService', 'userRoleService',
        'userService', 'userTagService', 'session','androidFunctionPasswordService'];

    return controller;
});
