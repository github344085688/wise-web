'use strict';
define([], function () {
    var ctrl = function ($scope, $state, $mdDialog, locationService, lincResourceFactory) {
        function init() {
            $scope.locationView = {gap:1};
            locationService.getZones().then(function (data) {
                $scope.zones = data;
            }, function () {
            });
        }

        init();

        $scope.reviewName = function () {
            var name = [];
            var prefix = $scope.locationView.prefix;
            var end = $scope.locationView.end;
            var from = $scope.locationView.from;
            var to = $scope.locationView.to;
            var gap = $scope.locationView.gap;


            if (from && to && gap && from < to) {
                for (from; from < to; from = from + gap) {
                    var tmp = "";
                    if (prefix) tmp = tmp + prefix;
                    if (from) tmp = tmp + from;
                    if (end) tmp = tmp + end;
                    name.push(tmp);
                }
            } else {
                var tmp = "";
                if (prefix) tmp = tmp + prefix;
                if (end) tmp = tmp + end;
                name.push(tmp);
            }
            $scope.locationView.name = name;
        }

        $scope.addBatchLocation = function () {
            if ($scope.locationView.name) {
                var locations = [];
                $scope.locationView.name.forEach(function (name) {
                    var location = {
                        name: name,
                        type: "LOCATION",
                        parentId: $scope.locationView.zone,
                        status: "USEABLE",
                        category: "WAREHOUSE",
                        supportEquipments: $scope.locationView.supportEquipments,
                        locationGroupId: $scope.locationView.locationGroupId,
                        supportPickType: $scope.locationView.supportPickType,
                    };

                    locations.push(location);
                });

                locationService.batchAddLocation(locations).then(function (response) {
                    $mdDialog.hide();
                }, function (error) {
                    $scope.errorMsg = error.data.error;
                });
            }

        };

        $scope.onSelectLocationGroup = function (locationGroup) {
            if($scope.locationView && locationGroup) {
                $scope.locationView.supportPickType = locationGroup.supportPickType;
                $scope.locationView.supportEquipments = locationGroup.supportEquipments;
            }
        }

        $scope.getPickTypes = function () {
            return lincResourceFactory.getPickTypes().then(function (response) {
                $scope.pickTypes = response;
            });
        };

        $scope.getLocationGroups = function(searchName) {
            locationService.searchLocationGroup({nameRegex: searchName}).then(function (data) {
                $scope.locationGroups = data;
            }, function (error) {

            });
        }

        $scope.cancel = function (form) {
            $mdDialog.cancel();
        };

    };
    ctrl.$inject = ['$scope', '$state', '$mdDialog', 'locationService',  'lincResourceFactory'];

    return ctrl;
});
