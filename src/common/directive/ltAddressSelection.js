'use strict';

define(['./directives', 'angular', 'lodash'], function (directives, angular, _) {
    directives.directive('ltAddressSelection', ['$parse', '$mdMedia', '$mdDialog' , 'addressService', function ($parse, $mdMedia, $mdDialog, addressService) {
        return {
            restrict: "A",
            scope: {
                ltAddressModel: '=ltAddressModel',
                ltAddressData: '=ltAddressData',
                ltAddressId: '=ltAddressId',
                organization: '@',
                cannotSwitchOrganization: "="
            },
            link: function (scope, elem, attrs) {
                elem.bind('click', function (event) {
                    popupAddress(event);
                });

                function popupAddress(ev) {
                    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                    $mdDialog.show({
                        controller: 'ltAddressSelectionController',
                        templateUrl: 'common/directive/template/ltAddressSelection.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: useFullScreen,
                        locals: {organizationId: scope.organization, cannotSwitchOrganization: scope.cannotSwitchOrganization}
                    }).then(function (data) {
                        var orgName = data.organizationName ? data.organizationName : "";
                        scope.ltAddressModel = addressService.generageAddressData(data);
                        scope.ltAddressData = data;
                        scope.ltAddressId = data.id;
                    });
                }
            }

        };
    }])

        .controller('ltAddressSelectionController', ['$scope', 'addressService', 'organizationService', 'cannotSwitchOrganization',
            '$mdDialog', 'organizationId', function ($scope, addressService, organizationService, cannotSwitchOrganization,
                                                     $mdDialog, organizationId) {

            $scope.select = function (index) {
                $scope.selectedAddress = $scope.addresses[index];
                $scope.selectedIndex = index;
            };

            function matchInProperty(object, searchText) {
                if (!searchText) {
                    return true;
                }

                for (var propertyName in object) {
                    if (object[propertyName].toString().toLocaleLowerCase().indexOf(searchText) !== -1) {
                        return true;
                    }
                }
            }


            $scope.search = function () {
                $scope.searchAddressCompleted = false;

                addressService.searchAddress($scope.searchInfo).then(function (data) {
                    // var fa = [];
                    // data.forEach(function(address) {
                    //     if (matchInProperty(address, $scope.searchInfo.anytext)) {
                    //         fa.push(address);
                    //     }
                    // });
                    $scope.addresses = data;
                    $scope.searchAddressCompleted = true;
                }, function () {
                });
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.ok = function () {
                $mdDialog.hide($scope.selectedAddress);
            };

            function init() {
                $scope.searchInfo = {};
                if (organizationId) {
                    $scope.searchInfo.organizationId = organizationId;
                }
                $scope.cannotSwitchOrganization = cannotSwitchOrganization;
                $scope.search();
            }

            init();

        }]);

});
