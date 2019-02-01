'use strict';

define(['angular','lodash'], function(angular, _) {
    var $scope = function($scope, $stateParams, blackSNService, itemService, lincUtil, $mdDialog, $state) {
        $scope.itemSpecOptionsMap = {};
        $scope.batchCreate = function() {
            var blackSNs = getBlackSNs(this.customerItems);
            $scope.loading = true;
            blackSNService.batchCreate(blackSNs).then(function(res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('fd.item.blackSN.list');
                });
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Update Error! ' + error.data.error);
            });
        };

        $scope.customerOnSelect = function (org, index) {
            $scope.itemSpecOptionsMap[index] = [];
            $scope.customerItems[index].itemSpecId = null;
            if(org) {
                itemService.itemSearch({customerIds: [org.id]}).then(function (itemSpecs) {
                    $scope.itemSpecOptionsMap[index] = itemSpecs;
                });
            }
        };

        $scope.addCustomerItem = function () {
            $scope.customerItems.push({});
        };

        $scope.removeCustomerItem = function (index) {
            $scope.customerItems.splice(index, 1);
        };

        $scope.cancelAddItemBlack = function(){
            $state.go('fd.item.blackSN.list');
        };

        function getBlackSNs(customerItems) {
            var blackSNs = [];
            var customerItems = _.flatten(customerItems);
            _.forEach(customerItems, function (item) {
                var blackSNobj = {customerId: item.customerId, itemSpecId: item.itemSpecId};
                _.forEach(item.sns, function (sn) {
                    var blackSN = angular.copy(blackSNobj);
                    blackSN.sn = sn;
                    blackSNs.push(blackSN);
                });
            });
            return blackSNs;
        }

        function init() {
            $scope.customerItems = [{}];
        }

        init();
        
    };
    $scope.$inject = ['$scope', '$stateParams', 'blackSNService', 'itemService', 'lincUtil', '$mdDialog', '$state'];
    return $scope;
});
