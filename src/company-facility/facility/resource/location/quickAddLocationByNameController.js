'use strict';
define([], function () {
    var ctrl = function ($scope, $state, $mdDialog, locationService, lincResourceFactory) {

        $scope.closeErrorAlert = function () {
            $scope.hasErrorMessage = false;
        };

        $scope.namesChange = function (nameVal) {
            $scope.locations = [];
            if (nameVal) {
                var replaceNameVal = nameVal.replace(/\n/g, ",");
                $scope.Names = _.split(replaceNameVal, ',');
                orgLocationDatas($scope.Names);
            }else{
                $scope.Names ="";   
            }

        };

        function orgLocationDatas(Names) {
            $scope.locations = [];
            Names=_.compact(Names);
            Names.forEach(function (name) {
                var location = {
                    name: name,
                    type: "LOCATION",
                    category: "WAREHOUSE"
                };

                $scope.locations.push(location);
            });
        }

        $scope.addBatchLocation = function () {
            $scope.loading=true;
            if ($scope.locations.length > 0) {
                locationService.batchAddLocation($scope.locations).then(function (response) {
                    $scope.loading=false;
                     $mdDialog.hide();
                }, function (error) {
                    $scope.loading=false;
                     $scope.hasErrorMessage = true;
                    $scope.errorMsg = error.data.error;
                });
            }

        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    };
    ctrl.$inject = ['$scope', '$state', '$mdDialog', 'locationService', 'lincResourceFactory'];

    return ctrl;
});
