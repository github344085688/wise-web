'use strict';

define([
    "lodash"
], function (_) {
    var $scope = function ($scope, facilityService, addressService) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.addressMap = {};

        function searchFacility(searchParam) {
            $scope.loading = true;
            facilityService.searchFacility(searchParam).then(function (data) {
                $scope.loading = false;
                $scope.facilities = data;
                var facilityIds = _.uniq(_.map($scope.facilities, "id"));
                if(facilityIds && facilityIds.length > 0) {
                    getAddressMap(facilityIds);
                    $scope.loadContent(1);
                }
            }, function () {
                $scope.loading = false;
            });
        }

        function getAddressMap(facilityIds) {
            addressService.searchAddressBasicInfo({orgIds: facilityIds, "wiseCompanyId": "across_all_companies" }).then(function (response) {
                if(response && response.length > 0) {
                    $scope.addressMap =  _.keyBy(response, 'organizationId');
                }
            });
        }

        $scope.search = function () {
            searchFacility($scope.searchInfo);
        };

        $scope.loadContent = function (currentPage) {
            $scope.facilitiesView = $scope.facilities.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.facilities.length ? $scope.facilities.length : currentPage * $scope.pageSize);
        };

        function _init() {
            searchFacility({});
        }

        _init();
    };
    $scope.$inject = ['$scope', 'facilityService', 'addressService'];
    return $scope;
});
