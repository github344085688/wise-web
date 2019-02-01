'use strict';

define([
    'angular',
    'lodash',
    'src/yms/black-list/addBlackListController'
], function(angular, _, addBlackListCtrl) {
    var controller = function($scope, $state, $resource, $mdDialog) {
        initSet();

        function initSet() {
            var entryList = $resource("/data/yms/black_list.json");
            entryList.query(function(list) {
                $scope.blackList = list;
            });
        }

        $scope.addBlackList = function() {
            var form = {
                templateUrl: 'yms/black-list/template/addBlackList.html',
                locals: {},
                autoWrap: true,
                controller: addBlackListCtrl
            };
            $mdDialog.show(form).then(function(param) {

                $scope.blackList = _.concat($scope.blackList, param.list);
                // console.log(arr);
                // saveItemLineSucceed(param);
            });
        };



        $scope.remove = function($index) {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Would you like to remove this?')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                $scope.blackList.splice($index, 1);

            });

        };
    };
    controller.$inject = ['$scope', '$state', '$resource', '$mdDialog'];
    return controller;
});
