'use strict';
define(['angular',
    'lodash',
    './selectAddressController'], function (angular, _, selectAddressController) {
        var controller = function ($scope, $state, $mdDialog, $stateParams, lincUtil, longHaulService) {


            $scope.longHaulShipDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            $scope.selectAddresses = [];
            $scope.longHaulView = {};

            $scope.addStops = function (title) {
                var form = {
                    templateUrl: 'foundation-data/milk-run/template/selectAddress.html',
                    locals: {
                        title: title,
                        organizationId: $scope.longHaulView.customerId
                    },
                    controllerAs: 'ctrl',
                    bindToController: true,
                    autoWrap: true,
                    controller: selectAddressController
                };

                $mdDialog.show(form).then(function (response) {

                    if (response.length > 0) {
                        _.forEach(response, function (address) {
                            if ($scope.selectAddresses.length > 0) {
                                $scope.selectAddressesMatchId = _.keyBy($scope.selectAddresses, 'id');
                                if (!$scope.selectAddressesMatchId[address.id]) {
                                    $scope.selectAddresses.push(address);
                                }
                            } else {
                                $scope.selectAddresses.push(address);
                            }

                        });
                    }
                });
            };

            $scope.addOrUpdateMilkRun = function () {
                var stops = IntegratedLongHaulStops();
                if (stops.length > 0) {
                    $scope.longHaulView.stops = IntegratedLongHaulStops();
                }

                $scope.loading = true;
                if ($scope.isAddAction) {
                    $scope.longHaulView.channel = 'MANUAL';
                    longHaulService.addLongHaul($scope.longHaulView).then(function (response) {
                        $scope.loading = false;
                        if (response.error) {
                            lincUtil.processErrorResponse(error);
                            return;
                        }

                        lincUtil.saveSuccessfulPopup(function () {
                            $state.go("fd.milkRun.list");
                        });
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                } else {
                    longHaulService.updateLongHaulById($stateParams.milkRunId, $scope.longHaulView).then(function () {
                        $scope.loading = false;
                        lincUtil.updateSuccessfulPopup(function () {
                            $state.go("fd.milkRun.list");
                        });
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }


            };


            function IntegratedLongHaulStops() {
                var stops = [];
                if ($scope.selectAddresses.length > 0) {
                    _.forEach($scope.selectAddresses, function (stop, i) {
                        var LongHaulStop = {}
                        LongHaulStop.retailerId = stop.organizationId;
                        LongHaulStop.addressStoreNo = stop.storeNo;
                        LongHaulStop.sequence = i + 1;
                        if (stop.hasOwnProperty("scheduleTime")) {
                            LongHaulStop.scheduleTime = stop.scheduleTime;
                        }
                        stops.push(LongHaulStop);
                    })
                }
                return stops;
            }

            $scope.removeStop = function (index) {
                $scope.selectAddresses.splice(index, 1);

            };

            $scope.changeAheadSequence = function (index) {
                var currentAddsress = angular.copy($scope.selectAddresses[index]);
                var aheadAddsress = angular.copy($scope.selectAddresses[index - 1]);
                $scope.selectAddresses[index - 1] = currentAddsress;
                $scope.selectAddresses[index] = aheadAddsress;

            };

            $scope.cancelEditLocation = function () {
                $state.go("fd.milkRun.list");
            };

            $scope.changeBehindSequence = function (index) {
                var currentAddsress = angular.copy($scope.selectAddresses[index]);
                var behindAddsress = angular.copy($scope.selectAddresses[index + 1]);
                $scope.selectAddresses[index + 1] = currentAddsress;
                $scope.selectAddresses[index] = behindAddsress;

            };

            $scope.autoAssignSequenceOnChange = function (bool) {

                if (bool) {
                    $scope.selectAddresses = _.orderBy($scope.selectAddresses, ['scheduleTime'], ['asc']);
                }

            };

            function init() {

                $scope.isAddAction = $stateParams.milkRunId ? false : true;
                if ($scope.isAddAction) {
                    $scope.submitLabel = "Save";

                } else {
                    $scope.submitLabel = "Update";
                    longHaulService.getLongHaulById($stateParams.milkRunId).then(function (response) {

                        var milkRun = response.milkRun;
                        $scope.longHaulView.autoAssignSequence = milkRun.autoAssignSequence;
                        $scope.longHaulView.customerId = milkRun.customerId;
                        $scope.longHaulView.longHaulNo = milkRun.longHaulNo;
                        $scope.longHaulView.longHaulShipDay = milkRun.longHaulShipDay;
                        $scope.longHaulView.description = milkRun.description;
                        $scope.longHaulView.scheduleTime = milkRun.scheduleTime;
                     
                      var stopsOrder= _.orderBy(milkRun.stops,["sequence"]);
                        _.forEach(stopsOrder, function (item) {
                            var stops = {}
                            stops.storeNo = item.addressStoreNo;
                            stops.organizationId = item.retailerId;
                            stops.organizationName = item.retailerName;
                            stops.scheduleTime = item.scheduleTime;
                            if (item.address) {
                                stops.id = item.address.id;
                                stops.name = item.address.name;
                                stops.city = item.address.city;

                            }
                            $scope.selectAddresses.push(stops);
                        });
                  

                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }

            }

            init();




        };
        controller.$inject = ['$scope', '$state', '$mdDialog', '$stateParams', 'lincUtil', 'longHaulService'];

        return controller;
    });
