'use strict';

define(['lodash'], function (_) {
    var controller = function ($scope, $state, $stateParams, lincUtil, locationService, session, organizationService) {


        var defaultLocationType = ['LOCATION', 'STAGING', 'DOCK'];
        var companyId = session.getCompanyFacility().companyId;
        var organizationId = $stateParams.organizationId;

        $scope.location = {};
        $scope.submitLabel = 'ADD';
        $scope.company = session.getCompanyFacility().company.name;

        function init() {
            getCurrentTileLocations();
            organizationService.getOrganizationById(organizationId).then(function (response) {
                $scope.organization = response.basic.name;
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }
        init();

        $scope.searchLocation = function (locationName) {
            var inputParams = { 'types': defaultLocationType, scenario: 'Auto Complete' };
            if (locationName)
                inputParams = { 'regexName': locationName, 'types': defaultLocationType, scenario: 'Auto Complete' };

            locationService.searchLocation(inputParams).then(function (data) {
                $scope.locations = data;
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        };

        $scope.cancelEditTitle = function () {
            $state.go("fd.organization.list");
        };

        $scope.addLocation = function () {
            var locationId = $scope.location.id;
            if (!locationId) {
                lincUtil.messagePopup("Tip", "Please select an location before to add");
            } else {
                addLocation()
            }
        };

        $scope.btnDel = function (index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                removeLocation(index);
            });
        };

        function getCurrentTileLocations() {
            var params = { 'types': defaultLocationType, tenantId: organizationId, companyId: companyId };
            locationService.searchLocation(params).then(function (data) {
                $scope.locationLists = data;
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }

        function addLocation() {
            var locationItem = {};
            locationItem.id = $scope.location.id;
            locationItem.companyId = companyId;
            locationItem.tenantId = organizationId;
            $scope.loading = true;
            locationService.updateLocation(locationItem).then(
                function () {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup();
                    getCurrentTileLocations();

                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                }
            );
        }

        function removeLocation(index) {
            var locationItem = {};
            locationItem.id = $scope.locationLists[index].id;
            locationItem.companyId = null;
            locationItem.tenantOrgId = null;
            locationService.updateLocation(locationItem).then(
                function () {
                    $scope.locationLists.splice(index, 1);
                }, function (error) {

                    lincUtil.errorPopup("Error:" + error.data.error);
                }
            );
        }

    };

    controller.$inject = ['$scope', '$state', '$stateParams',
        'lincUtil', 'locationService', 'session', 'organizationService'];

    return controller;
});
