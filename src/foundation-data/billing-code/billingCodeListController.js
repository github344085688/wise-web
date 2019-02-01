'use strict';

define(["lodash"], function(_) {
    var $scope = function($scope, billingCodeService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        function searchBillingCode(searchParam) {
            $scope.loading = true;
            billingCodeService.searchBillingCode(searchParam).then(function(data) {
                $scope.loading = false;
                $scope.billingCodes = data;
                $scope.loadContent(1);
            }, function() {});
        }

        $scope.search = function() {
            searchBillingCode($scope.searchInfo);
        };

        $scope.loadContent = function(currentPage) {
            $scope.billingCodeView = $scope.billingCodes.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.billingCodes.length ? $scope.billingCodes.length : currentPage * $scope.pageSize);
        };

        $scope.disable = function(id) {
            lincUtil.confirmPopup("Disable Billing Code", "Are you sure to disable this billing code?", function() {
                $scope.loading = true;
                billingCodeService.disableBillingCode(id).then(function() {
                    $scope.loading = false;
                    _.forEach($scope.billingCodeView, function (item) {
                        if (item.id === id) item.status = "DISABLE";
                    })
                    _.forEach($scope.billingCodes, function (item) {
                        if (item.id === id) item.status = "DISABLE";
                    })

                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup('Disable Billing Code Error! ' +  error.data.error);
                });
            });
        };

        $scope.enable = function(id) {
            $scope.loading = true;
            billingCodeService.enableBillingCode(id).then(function () {
                $scope.loading = false;
                _.forEach($scope.billingCodeView, function (item) {
                    if (item.id === id) item.status = "ENABLE";
                })
                _.forEach($scope.billingCodes, function (item) {
                    if (item.id === id) item.status = "ENABLE";
                })

            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup('Enable Billing Code Error! ' + error.data.error);
            });
        };

        $scope.delete = function(id) {
            lincUtil.confirmPopup("Delete Billing Code", "Are you sure to delete this billing code?", function() {
                $scope.loading = true;
                billingCodeService.deleteBillingCode(id).then(function() {
                    $scope.loading = false;
                    _.remove($scope.billingCodeView, function (item) {
                        return item.id === id;
                    });
                    _.remove($scope.billingCodes, function (item) {
                        return item.id === id;
                    });

                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup('Delete Billing Code Error! ' +  error.data.error);
                });
            });
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search();
            }
            $event.preventDefault();
        };

        function _init() {
            searchBillingCode({});
        }

        _init();
    };
    $scope.$inject = ['$scope', 'billingCodeService', 'lincUtil'];
    return $scope;
});
