'use strict';

define([
    'angular',
    'lodash',
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, locationItemService,locationService,$http) {

        $scope.pageSize = 10;
        $scope.searchParam = {isFixed:true };
        $scope.expandLine = {};

        $scope.expandOrStrinkName ='Expand All';

        $scope.scenarios  = [
        { name:"Show All Locations",dbName:"SHOW_ALL_LOCATIONS"},
        { name:"Available Location Only",dbName:"AVAILABLE_LOCATION_ONLY"}, 
        { name:"Fixed Location Only",dbName:"FIXED_LOCATION_ONLY"}
        ];

        $scope.onlyShowFixeds  = [
            { name:"Yes",dbName:true},
            { name:"No",dbName:false}, 
            ];
        
        $scope.expand = function(index){
            $scope.expandLine[index] =!$scope.expandLine[index];
        };

        $scope.expandOrShrinkAll = function(){
            if($scope.expandOrStrinkName === 'Expand All'){
                _.forEach($scope.expandLine, function(val ,key){
                    $scope.expandLine[key] = true;
                });
                $scope.expandOrStrinkName ='Strink All' ;
            }else{
                _.forEach($scope.expandLine, function(val ,key){
                    $scope.expandLine[key] = false;
                });
                $scope.expandOrStrinkName ='Expand All' ;
            }
         
        };



        $scope.search = function () {
            $scope.loadContent(1);
        };

        $scope.advanced =function(){
            $scope.searchParam = {isFixed:true };
            $scope.isAdvanced= !$scope.isAdvanced;
        }


        $scope.loadContent = function (currentPage){
            $scope.locationItems = [];
            $scope.totalCount = 0;
            $scope.loading = true;
            var param = angular.copy($scope.searchParam);
            _.forEach(param, function (value, key) {
                if (!value && typeof value !== 'boolean') {
                    delete param[key];
                }
            });
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            locationItemService.searchLocationItem(param).then(function (response) {
                if(response.results){
                    $scope.locationItems = response.results.data;
                    $scope.totalCount = response.paging.totalCount;
                }
      
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.getItems =function(items){
              return  _.map(items,'Item#').join(',');
        };

        $scope.deleteRelation = function (item) {
           
            lincUtil.deleteConfirmPopup('Would you like to unfix this record', function () {
                locationItemService.deleteLocationItem(item.id).then(function (response) {
                    lincUtil.messagePopup("Message", "Unfix Successful.",function(){
                        item['isFixed'] = 'N';
           
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };
 
        $scope.createRelation = function(item){
            lincUtil.deleteConfirmPopup('Would you like to fix this record', function () {
                locationItemService.addLocationItem({locationId:item.locationId,itemSpecId:item.itemSpecId}).then(function (response) {
                    lincUtil.messagePopup("Message", "Fix Successful.",function(){
                        item.id = response.id;
                        item['isFixed'] = 'Y';
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };


        $scope.export = function () {

            if ($scope.exporting) return;
            $scope.exporting = true;
            var param = angular.copy($scope.searchParam);
            _.unset(param,'isFixed');
            _.forEach(param, function (value, key) {
                if (!value && typeof value !== 'boolean') {
                    delete param[key];
                }
            });
            $http.post("/report-center/location-item/download", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "Location&Item.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };


        function searchLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        }


        function _init() {
            $scope.search();
            searchLocationGroup();
        }

        _init();

    };


    controller.$inject = ['$scope', '$state', 'lincUtil', 'locationItemService','locationService','$http'];
    return controller;
});