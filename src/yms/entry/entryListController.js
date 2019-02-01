'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $state, $resource) {
        initSet();
        function initSet()
        {
            
            var entryList = $resource("/data/yms/entry_list.json");
            entryList.query(function(list){
                $scope.entryList = list;
            });
        }
    };
    controller.$inject = ['$scope', '$state', '$resource'];
    return controller;
});
