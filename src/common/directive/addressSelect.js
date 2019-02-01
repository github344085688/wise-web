'use strict';

define(['./directives', 'angular', 'lodash', 'slimscroll'], function (directives, angular, _) {
    directives.directive('addressSelect', ['$parse', '$mdMedia', '$mdDialog', 'addressService',
        function ($parse, $mdMedia, $mdDialog, addressService) {
        return {
            restrict: "A",
            scope: {
                addressModel: '=addressModel',
                addressData: "=addressData",
                addressExpression: '@',
                organization: '@',
                organizationTag: '@',
                addressTag: '@'
            },
            link: function (scope, elem, attrs) {
                scope.addressData = "";
                elem.bind('click', function (event) {
                    popupAddress(event);
                });
                function popupAddress(ev) {
                    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                    $mdDialog.show({
                        controller: 'addressSelectController',
                        templateUrl: 'common/directive/template/addressSelect.html',
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: useFullScreen,
                        locals: {organizationId: scope.organization, address:scope.addressModel,
                            organizationTag: scope.organizationTag,
                            addressTag: scope.addressTag},
                        onComplete: function(scope, element) {
                            element.find("slim-scoller").next().slimScroll({
                                allowPageScroll: true, // allow page scroll when the element scroll is ended
                                size: '10px',
                                color: '#bbb',
                                wrapperClass: 'slimScrollDiv',
                                railColor:  '#eaeaea',
                                position: 'right',
                                height: 550,
                                alwaysVisible: true ,
                                opacity: .8,
                                railOpacity : .4,
                                railVisible:true,
                                disableFadeOut: false
                            });
                        }
                    }).then(function (data) {
                        scope.addressData = addressService.generageAddressData(data, scope.addressExpression);
                        scope.addressModel = data;
                    });
                }

                scope.$watch("addressModel", function (data) {
                        scope.addressData = addressService.generageAddressData(scope.addressModel, scope.addressExpression);
                });
            }
        };
    }])

        .controller('addressSelectController', ['$scope', 'addressService', 'organizationService', '$mdDialog',
            'organizationId', 'address', 'organizationTag', 'addressTag',
            function ($scope, addressService, organizationService, $mdDialog,
                      organizationId, address, organizationTag, addressTag) {
            $scope.onClickAddress = function (address) {
                $scope.currentAddress = angular.copy(address);
                if (!$scope.currentAddress.contacts || $scope.currentAddress.contacts.length < 1) {
                    $scope.currentAddress.contacts = [{}];
                }
            };

            $scope.search = function () {
                $scope.searchAddressCompleted = false;
                addressService.searchAddress($scope.searchInfo).then(function (data) {
                    $scope.addresses = data;
                    $scope.searchAddressCompleted = true;
                }, function () {
                });
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.searchNameOnKeyPress = function (event) {
                if(event.keyCode == 13) {
                    $scope.search();
                }
            };

            $scope.fillAddressByZip = function (zipcode) {
                $scope.isSearchAddress = true;
                addressService.getAddressByZipCode(zipcode).then(function (data) {
                    $scope.currentAddress.state = data.state;
                    $scope.currentAddress.city = data.city;
                    $scope.currentAddress.country = data.country;
                    $scope.isSearchAddress = false;
                }, function (error) {
                    $scope.isSearchAddress = false;
                });
            };

            $scope.saveAddress = function () {
                if(addressTag) {
                    $scope.currentAddress.tags = [addressTag];
                }
                $mdDialog.hide($scope.currentAddress);
            };

            $scope.onSelectOrganization = function(org){
                $scope.currentAddress.organizationName = org.name;
            };

            function init() {
                $scope.searchInfo = {};
                if(address) {
                    $scope.currentAddress = angular.copy(address);
                }else {
                    $scope.currentAddress = {};
                }
                if (organizationId) {
                    $scope.searchInfo.organizationId = organizationId;
                }
                if (organizationTag) {
                    $scope.organizationTag = organizationTag;
                }
                $scope.search();
            }
            init();
        }]);

});
