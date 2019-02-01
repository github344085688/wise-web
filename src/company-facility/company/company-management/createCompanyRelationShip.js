

'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, lincUtil, company, facilityService, organizationRelationshipService, userService, $q) {

        $scope.facilityRelation = {};
        $scope.relationShips = [];
        $scope.isShowError = false;

        var oldFacilityIds = [];
        var oldRelations = [];

        $scope.submitFacility = function () {

            if ($scope.relationShips) {
                var newFacilityIds = _.map($scope.relationShips, 'basic.id');

                var RemovedRelationShips = [];
                var AddedRelationShips = [];
                if (oldFacilityIds.length) {
                    angular.forEach(oldFacilityIds, function (facilityId) {
                        if (_.indexOf(newFacilityIds, facilityId) < 0) {
                            var removeRelationItem = {};
                            removeRelationItem.orgId = facilityId;
                            removeRelationItem.partnerId = company.id;
                            removeRelationItem.role = 'Company';
                            RemovedRelationShips.push(removeRelationItem);
                        }

                    });
                    angular.forEach(newFacilityIds, function (facilityId) {
                        if (_.indexOf(oldFacilityIds, facilityId) < 0) {
                            var addRelationItem = {};
                            addRelationItem.organizationId = facilityId;
                            addRelationItem.partnerId = company.id;
                            addRelationItem.relationships = ['Company'];
                            AddedRelationShips.push(addRelationItem);
                        }

                    });


                }
                else {
                    angular.forEach(newFacilityIds, function (facilityId) {
                        var addRelationItem = {};
                        addRelationItem.organizationId = facilityId;
                        addRelationItem.partnerId = company.id;
                        addRelationItem.relationships = ['Company'];
                        AddedRelationShips.push(addRelationItem);

                    });
                }


                if (AddedRelationShips.length) {
                    addRelationship(AddedRelationShips).then(function (res) {
                        $scope.loading = false;
                        $mdDialog.hide($scope.relationShips);

                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
                else {
                    if (newFacilityIds.length === oldFacilityIds.length)
                        $mdDialog.cancel();
                }

                if (RemovedRelationShips.length) {
                    searchUsersRelations(RemovedRelationShips).then(function (response) {

                        if (response[0].length) {
                            $scope.isShowError = true;
                            $scope.relationShips = oldRelations;
                            oldRelations = angular.copy(oldRelations);
                            $scope.errorLabel = 'You can not delete it ,Please contact administrator';
                        }
                        else {

                            DeleteRelationship(RemovedRelationShips).then(function (response) {
                                $mdDialog.hide($scope.relationShips);
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                        }
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }

            }

        };

        function addRelationship(addRelationLists) {

            $scope.loading = true;
            var promises = [];
            addRelationLists.forEach(function (relationShipList) {
                var promise = organizationRelationshipService.createRelationship(relationShipList);
                promises.push(promise);
            });
            return $q.all(promises);


        }

        function DeleteRelationship(removeRelationLists) {

            var promises = [];
            removeRelationLists.forEach(function (removeRelation) {
                var promise = organizationRelationshipService.deleteRelationshipRole(removeRelation.orgId, removeRelation.partnerId, removeRelation.role);
                promises.push(promise);
            });
            return $q.all(promises);

        }

        function searchUsersRelations(removeRelationLists) {
            var promises = [];
            removeRelationLists.forEach(function (removeRelation) {
                var promise = userService.searchUsers({ facilityId: removeRelation.orgId, companyId: removeRelation.partnerId });
                promises.push(promise);
            });
            return $q.all(promises);

        }

        function searchRelationship() {
            organizationRelationshipService.searchRelationship({ partnerId: company.id, relationship: "Company", scenario: "ORGANIZATION_ONLY_THE_BASIC" }).then(function (response) {
                $scope.relationShips = response;
                oldFacilityIds = _.map(response, 'basic.id');
                oldRelations = angular.copy(response);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function searchFacility() {
            facilityService.searchFacility({}).then(function (response) {
                $scope.facilities = response;
            }, function () { });
        }

        $scope.cancelDialog = function () {
            $mdDialog.cancel();
        };

        $scope.btnDel = function (index) {
            $scope.relationShips.splice(index, 1);
        }


        $scope.addFacilityItem = function () {

            if ($scope.facilityRelation.facility && validateFacility()) {

                $scope.relationShips.push($scope.facilityRelation.facility);

            }

        }
        function validateFacility() {
            var tips = true;
            _.forEach($scope.relationShips, function (relationship) {
                if (relationship.basic.id === $scope.facilityRelation.facility.id) {
                    tips = false;
                };
            });
            if (!tips) {
                $scope.isShowError = true;
                $scope.errorLabel = 'Duplicate Column';
            }
            else {
                $scope.isShowError = false;
            }

            return tips;
        }

        function init() {
            searchFacility();
            searchRelationship();
            $scope.title = "Relate Facility";
            $scope.submitLabel = "Save";
            $scope.company = company;
        }
        init();
    }

    controller.$inject = ['$scope', '$mdDialog', 'lincUtil', 'company', 'facilityService', 'organizationRelationshipService', 'userService', '$q'];
    return controller;
});