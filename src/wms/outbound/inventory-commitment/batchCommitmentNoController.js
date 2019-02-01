'use strict';

define(['angular', 'moment'], function (angular, moment) {
    var controller = function ($scope, $mdDialog, selectedOrdersCount, longHaul, customerIds, customerService) {

        var body = angular.element(document.querySelector('body'));
        body.addClass("fixed");
        $scope.selectedOrdersCount = selectedOrdersCount;
        $scope.batchCommitment = { batchCommitmentNo: moment(new Date()).format("YYYYMMDD_HHmmss"), longHaulId: '', scheduleDate: null };
        $scope.cancel = function () {
            body.removeClass("fixed");
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            if (!$scope.batchCommitment.batchCommitmentNo) {
                $scope.errorMesg = "Please enter Batch Commitment No!";
                return;
            }
            if ($scope.isHasCollectLongHaulWhenCommit && !$scope.batchCommitment.longHaulId) {
                $scope.errorMesg = "Please select a longHaul No!";
                return;
            }
            body.removeClass("fixed");
            $mdDialog.hide($scope.batchCommitment);
        };


        function _init() {
            customerService.searchCustomer({ orgIds: customerIds }).then(function (customers) {
                if (customers) {
                    $scope.isHasCollectLongHaulWhenCommit = false;
                    _.forEach(customers, function (customer) {
                        if (customer.collectLongHaulWhenCommit) {
                            if (longHaul.length == 1) {
                                $scope.batchCommitment.longHaulId = longHaul[0].id;
                            }
                            $scope.isHasCollectLongHaulWhenCommit = true;
                        }
                    });
                }
            });

        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', 'selectedOrdersCount', 'longHaul', 'customerIds', 'customerService'];
    return controller;
});