'use strict';
define([
], function() {
    var controller = function($scope, inventoryService, $resource, $state, $stateParams) {
        function initSet()
        {
            if($stateParams.inventoryId) getInventory($stateParams.inventoryId);
        }
        initSet();
        function getInventory(inventoryId) {
            inventoryService.getInventory(inventoryId).then(function(inventory)
            {
                $scope.inventory = inventory;
            });
        }
    };
    controller.$inject = ['$scope', 'inventoryService', '$resource', '$state', '$stateParams'];
    return controller;
});