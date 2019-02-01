'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope,  $mdDialog, itemLine, snList,lincUtil,receiptService,isEditSNDetail) {
       $scope.receiptItemLine = {}
       $scope.loading = false;

        initSet();
        function initSet() {
            $scope.isEditSNDetail=isEditSNDetail;
            var newsnList=[];
            _.forEach(snList, function(item){
                newsnList.push({sn:item,weight:null});
            })
            $scope.snDetails = _.unionBy(itemLine.snDetails,newsnList,'sn');
            $scope.OldsnDetails=angular.copy($scope.snDetails);
            $scope.receivedSNDetail = itemLine.receivedSNDetail;
            $scope.receivedList = _.keyBy($scope.receivedSNDetail,"sn");
            var itemsns = _.map($scope.snDetails,"sn");
            $scope.receivedSNList = [];
            _.forEach($scope.receivedSNDetail, function(item){
                if(_.indexOf(itemsns,item.sn) == -1){
                    $scope.receivedSNList.push(item);
                }
            })
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            if(!_.isEqual($scope.OldsnDetails, $scope.snDetails)){
                $scope.loading=true;
                receiptService.updateReceiptItemLineSNDetail(itemLine.receiptId, itemLine.id, {snDetails:$scope.snDetails}).then(function (response) {
                    $scope.loading=false;
                    lincUtil.saveSuccessfulPopup();
                    $mdDialog.hide({snDetails:$scope.snDetails,snList:_.map($scope.snDetails, 'sn')});
                },function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.loading = false;
                });
            }

        };
    };
    controller.$inject = ['$scope', '$mdDialog','itemLine','snList','lincUtil','receiptService','isEditSNDetail'];
    return controller;
});