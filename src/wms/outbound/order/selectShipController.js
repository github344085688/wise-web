'use strict';

define([], function() {
    var controller = function($scope, $resource, lincResourceFactory, $mdDialog, title) {

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.valueChange = function () {
            getList($scope.searchValue);
        };

        $scope.submit = function() {
            if($scope.list)
            {
                var selectedRow = $scope.list.selectedRow;
                if (typeof(selectedRow) != "undefined") {
                    $mdDialog.hide({data:$scope.list[selectedRow], title: title});
                } else {
                    // var confirm = $mdDialog.confirm()
                    //     .title('Confirm')
                    //     .textContent('Please select a record!')
                    //     .ok('Yes');
                    // $mdDialog.show(confirm);
                }
            }

        };

        function getShipToList(param) {
            lincResourceFactory.getShipToList(param).then(function(response) {
                $scope.list = response;
            });
        }
        function getShipFromList(param) {
            lincResourceFactory.getShipFromList(param).then(function(response) {
                $scope.list = response;
            });
        }

        function getList(param) {
            if(title === "Ship To") getShipToList(param);
            else if(title === "Ship From") getShipFromList(param);
            else if(title === "Bill To") getShipFromList(param);
        }
        getList();

        $scope.title = title;
    };
    
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory', '$mdDialog', 'title'];
    return controller;
});
