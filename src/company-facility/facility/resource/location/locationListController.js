'use strict';

define(['./quickAddLocationController','./quickAddLocationByNameController','./bacthUploadLocationController', 'angular', 'lodash'], function (quickAddLocationCtrl, quickAddLocationByNameCtrl,bacthUploadLocationController,angular, _) {
    var ctrl = function ($scope, $mdDialog, $http, locationService, lincUtil, lincResourceFactory) {
        var ctrl = this;
        ctrl.pageSize = 10;
        ctrl.searchInfo = {};
        $scope.locationTypes = ["ZONE", "LOCATION", "STAGING", "PARKING", "DOCK", "BASE",  "PICK","SORTING","OTHER"];
        var searchParam = {categories: ['DOCK', 'WAREHOUSE']};
        getZone();

        locationService.searchLocationGroup({}).then(function (data) {
            $scope.locationGroups = data;
        }, function (error) {
            lincUtil.processErrorResponse(error);
        });
        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                ctrl.loadContent(1);
            }
            $event.preventDefault();
        };
        ctrl.loadContent = function (currentPage) {
            ctrl.searchLocationCompleted = false;
            var param = angular.copy(ctrl.searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number(ctrl.pageSize)};
            locationService.locationSearchByPaging(param).then(function (response) {
                ctrl.searchLocationCompleted = true;
                ctrl.locations = response.locations;
                ctrl.paging = response.paging;
            }, function () {
                ctrl.searchLocationCompleted = true;
            });
        };

        ctrl.remove = function (index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                locationService.remove(ctrl.addresses[index].id).then(function () {
                    ctrl.addressesView.splice(index, 1);
                }, function () {
                    lincUtil.errorPopup("Error Found While Removing");
                });

            });
        };

        ctrl.quickAdd = function () {
            var form = {
                templateUrl: 'company-facility/facility/resource/location/template/quickAddLocation.html',
                locals: {},
                autoWrap: true,
                controller: quickAddLocationCtrl
            };
            $mdDialog.show(form).then(function (response) {
                ctrl.search();
            });
        };

        
        ctrl.quickAddByName = function () {
            var form = {
                templateUrl: 'company-facility/facility/resource/location/template/quickAddLocationByName.html',
                locals: {},
                autoWrap: true,
                controller: quickAddLocationByNameCtrl
            };
            $mdDialog.show(form).then(function (response) {
                lincUtil.saveSuccessfulPopup(function(){
                    ctrl.search();
                });
                
            });
        };

        ctrl.search = function () {
            ctrl.loadContent(1);
        };

        function getZone() {
            locationService.getZones().then(function (data) {
                $scope.zones = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.getPickTypes = function () {
            return lincResourceFactory.getPickTypes().then(function (response) {
                $scope.pickTypes = response;
            });
        };

        ctrl.loadContent(1);

        ctrl.export = function () {
            if (ctrl.exporting) return;
            ctrl.exporting = true;

            $http.post("/base-app/location/export", ctrl.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    ctrl.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "location.xls");
                ctrl.exporting = false;

            }, function (error) {
                lincUtil.processErrorResponse(error);
                ctrl.exporting = false;
            });
        };

        ctrl.resetPickStrategyWeight = function() {
            lincUtil.confirmPopup("Tip", "This will reset all the locations pick strategy weight, are you still want to continue?", function(){
                locationService.resetPickStrategyWeight().then(function(){
                    ctrl.search();
                    lincUtil.messagePopup("Tip", "Reset pick strategy weight for all locations successful.");
                }, function(error){
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        $scope.checkAllLocationIds = [];
        $scope.selectAll = false;
        $scope.checkAllLocationIds = [];
        $scope.checkAllLocations = function () {
            var currentPageLocationIds = _.map(ctrl.locations, 'id');
            if ($scope.selectAll) {
                $scope.checkAllLocationIds = [];
                $scope.selectAll = false;
            }
            else {
                $scope.checkAllLocationIds = currentPageLocationIds;
                $scope.selectAll = true;
            }
        }
        $scope.checkLocation = function (location) {
            if (_.indexOf($scope.checkAllLocationIds, location.id) > -1) {
                _.remove($scope.checkAllLocationIds, function (locationId) {
                    return location.id == locationId;
                })
            } else {
                $scope.checkAllLocationIds.push(location.id);
            }
        }
        $scope.isChecked = function (location) {
            return _.indexOf($scope.checkAllLocationIds, location.id) > -1;
        }
        $scope.batchTenant = function () {
            if ($scope.checkAllLocationIds.length <= 0) {
                lincUtil.errorPopup("Please select Location first");
            }
            else {
                var form = {
                    templateUrl: 'company-facility/facility/resource/location/template/bacthUploadLocation.html',
                    locals: {
                        checkAllLocationIds: $scope.checkAllLocationIds,
                    },
                    autoWrap: true,
                    controller: bacthUploadLocationController
                };
                $mdDialog.show(form).then(function (response) {
                    ctrl.loadContent(1);
                });

            }
        }

    };
    ctrl.$inject = ['$scope', '$mdDialog', '$http', 'locationService', 'lincUtil', 'lincResourceFactory'];
    return ctrl;
});
