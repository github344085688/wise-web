'use strict';
define([
    './factories'
], function (factories, _) {
    factories.factory('favoriteMenuService', function ($resource) {
        var service = {};
        var searchConfig = {
            'postSearch': {
                method: 'POST',
                isArray: true
            }
        };
        var updateConfig = {
            'update': {
                method: 'PUT'
            }
        };

        service.getFavoritesMenu = function (userId ) {
            return $resource("/idm-app/user/:id/favorites",{ id: userId  }).query().$promise;
        };

        service.createFavoritesMenu = function (userId ,param) {
            return $resource("/idm-app/user/:id/favorite", { id: userId  }, { 'update': { 'method': 'POST'}}).save(param).$promise;
        };

        service.removeFavoritesMenu = function (userId ,param) {
            return $resource("/idm-app/user/:id/favorite/remove ",{ id: userId }, updateConfig).update(param).$promise;
        };

        return service;
    });
});