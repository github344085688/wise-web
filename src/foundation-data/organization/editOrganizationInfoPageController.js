'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var controller = function ($scope, $state, $stateParams, lincUtil, $q, customerService, $http,
                               organizationService, organizationRelationshipService,
                               session) {
        var ctrl = this;
        ctrl.isAddAction = $stateParams.organizationId ? false : true;
        ctrl.upperRoles = ["CUSTOMER", "TITLE", "SUPPLIER", "BRAND", "RETAILER", "TENANT"];
        ctrl.roles = ["Customer", "Title", "Supplier", "Brand", "Retailer", "Tenant"];

        var selectedRoles = [];
        var beforeUpdateRoles;
        var companyId;
        $scope.logoFileId = '';
        init();
        function init() {
            companyId = session.getCompanyFacility().companyId;
            if (ctrl.isAddAction) {
                $scope.submitLabel = "Save";
                ctrl.organization = { basic: {}, extend: { contacts: [{}] } };
            } else {
                $scope.submitLabel = "Update";
                organizationService.getOrganizationAndRoles(companyId, $stateParams.organizationId).then(function (response) {

                    ctrl.organization = response;
                    $scope.logoFileId = response.extend.logoFileId;
                    selectedRoles = ctrl.organization.roles ? ctrl.organization.roles : [];
                    if(selectedRoles.indexOf("Title") > -1 || selectedRoles.indexOf("Customer") > -1){
                        $scope.isCustomerCodeRequired = true;
                    }else{
                        $scope.isCustomerCodeRequired = false ;
                    }
                    beforeUpdateRoles = angular.copy(selectedRoles);
                    if (!ctrl.organization.extend.contacts || ctrl.organization.extend.contacts.length === 0) {
                        ctrl.organization.extend.contacts = [{}];
                    }
                    if (!ctrl.organization.extend.orgId) {
                        ctrl.organization.extend.orgId = ctrl.organization.basic.id;
                    }
                    isCustomerCodeDisabled(response);
                }, accessServiceFail);
            }
        }

        function isCustomerCodeDisabled (response) {
            if(response.extend.customerCode && response.roles.indexOf("Customer")> -1) {
                $scope.isCustomerCodeDisabled=true;
            }else {
                $scope.isCustomerCodeDisabled=false;
            }
        }

        $scope.organizationFileChange = function (element) {

            $scope.$apply(function () {
                $scope.organizationFileLoading=true;
                var organizationFile = new FormData();
                organizationFile.append("img", element.files[0]);
                organizationFile.append("app", "fd-app");
                organizationFile.append("module", "organization");
                organizationFile.append("service", "logofile");
                var url = "/file-app/file-upload";
                $http.post(url, organizationFile, {
                    withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(function(resp) {
                    $scope.ctrl.organization.extend.logoFileId = resp.data.filesId[0];
                    updateOrganization(ctrl.organization, companyId);
                    $scope.organizationFileLoading=false;
                }, function (error) {
                    $scope.organizationFileLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        ctrl.addOrUpdateOrganization = function () {
            if(selectedRoles.indexOf("Customer")> -1 && !$scope.ctrl.organization.extend.customerCode) {
                lincUtil.errorPopup('Error:Customer Code Can Not Be Empty');
                return false;
            }else {
                if (validateTags()) {
                    $scope.loading = true;
                    if (ctrl.isAddAction && !ctrl.organization.basic.id) {
                        validaOrganizationName(function () {
                            createOrganization(ctrl.organization, companyId);
                        });

                    } else {
                        updateOrganization(ctrl.organization, companyId);
                    }
                }
            }

        };
        function validaOrganizationName(callback) {
            organizationService.searchOrganization({ name: ctrl.organization.basic.name }).then(function (res) {
                if (res.length > 0) {
                    $scope.loading = false;
                    lincUtil.errorPopup("The name " + ctrl.organization.basic.name + " was existed." );
                    return;
                }
                else {
                    callback();
                }

            }, function (error) {
                callback();
            });

        }
        function updateOrganization(organization, companyId) {
            var organizationId = organization.basic.id;
            saveCustomerWhenUpdateOrganization(organizationId);
            var deleteRoles = _.difference(beforeUpdateRoles, selectedRoles);
            organizationService.updateOrganization(organization).then(function () {
                createOrganizationRelationShip(companyId, organizationId, selectedRoles).then(function () {
                    if (deleteRoles && deleteRoles.length > 0) {
                        deleteRelationships(companyId, organizationId, deleteRoles).then(updateOrganizationSuccess, accessServiceFail);
                    } else {
                        updateOrganizationSuccess();
                    }
                }, accessServiceFail);
            }, accessServiceFail);
        }

        function createOrganization(organization, companyId) {
            if(organization.extend){
                organization.extend.channel = 'MANUAL';
            }else{
                organization.extend ={channel: 'MANUAL'};
            }

            organizationService.createOrganization(organization).then(function (res) {
                organization.basic.id = res.id;
                saveCustomerWhenCreateOrganization(res.id);
                createOrganizationRelationShip(companyId, res.id, selectedRoles)
                    .then(saveOrganizationSuccess, accessServiceFail);
            }, accessServiceFail);
        }

        function saveCustomerWhenUpdateOrganization(orgId) {
            if (selectedRoles.indexOf("Customer") > -1 && beforeUpdateRoles.indexOf("Customer") < 0) {
                customerService.searchCustomer({ orgId: orgId }).then(function (customers) {
                    if (customers.length == 0) {
                        customerService.createCustomer({ orgId: orgId }).then(function (res) {
                        });
                    }
                });
            }
        }

        function saveCustomerWhenCreateOrganization(orgId) {
            if (selectedRoles.indexOf("Customer") > -1) {
                customerService.createCustomer({ orgId: orgId }).then(function (res) {
                });
            }
        }

        function createOrganizationRelationShip(organizationId, partnerId, relationships) {
            if (relationships.length > 0) {
                return organizationRelationshipService.createRelationship(
                    { organizationId: organizationId, partnerId: partnerId, relationships: relationships });
            } else {
                var deferred = $q.defer();
                deferred.resolve("success");
                return deferred.promise;
            }
        }

        function deleteRelationships(orgId, partnerId, roles) {
            var promises = [];
            roles.forEach(function (role) {
                var promise = organizationRelationshipService.deleteRelationshipRole(orgId, partnerId, role);
                promises.push(promise);
            });
            return $q.all(promises);
        }

        function saveOrganizationSuccess() {
            $scope.loading = false;
            lincUtil.saveSuccessfulPopup(function () {
                $state.go("fd.organization.edit.basicInfo", { organizationId: ctrl.organization.basic.id });
            });
        }

        function updateOrganizationSuccess() {
            lincUtil.updateSuccessfulPopup(function () {
                $state.reload();
            });
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        ctrl.cancelEditOrganization = function () {
            $state.go("fd.organization.list");
        };

        /*联系信息.*/
        ctrl.addContactInfo = function (index) {
            ctrl.organization.extend.contacts.push({});
        };

        ctrl.removeContactInfo = function (index) {
            ctrl.organization.extend.contacts.splice(index, 1);
        };

        /*选中checkbox并初始化Tab*/
        ctrl.isSelected = function (name) {
            return selectedRoles.indexOf(name) >= 0;
        };

        ctrl.updateSelection = function ($event, tag) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            ctrl.updateSelected(action, checkbox.name);
            if(selectedRoles.indexOf("Title") > -1 || selectedRoles.indexOf("Customer") > -1){
                $scope.isCustomerCodeRequired = true;
            }else{
                $scope.isCustomerCodeRequired = false ;
            }
        };

        ctrl.updateSelected = function (action, name) {
            if (action == 'add' && selectedRoles.indexOf(name) == -1) {
                selectedRoles.push(name);
            }
            if (action == 'remove' && selectedRoles.indexOf(name) != -1) {
                var idx = selectedRoles.indexOf(name);
                selectedRoles.splice(idx, 1);
            }
            if($scope.ctrl.organization.extend.customerCode && selectedRoles.indexOf("Customer")> -1) {
                $scope.isCustomerCodeDisabled=true;
            }else {
                $scope.isCustomerCodeDisabled=false;
            }
        };

        function validateTags() {
            var isValid = true;
            if (!Boolean(selectedRoles.toString())) {
                isValid = false;
                lincUtil.errorPopup('Please Select The Tags');
            }
            return isValid;
        }
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', '$q', 'customerService', '$http',
        'organizationService', 'organizationRelationshipService', 'session'];

    return controller;
});
