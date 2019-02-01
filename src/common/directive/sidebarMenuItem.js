'use strict';

define([
    'lodash',
	'./directives'
], function(_, directives) {
        return directives.directive('sidebarMenuItem', ['session', 'lincUtil', 'favoriteMenuService', '$rootScope', function (session, lincUtil, favoriteMenuService, $rootScope) {
		return {
            restrict: 'EAC',
			scope: {
				menuData: '=ngModel'
			},
			templateUrl: 'common/directive/template/sidebarMenuItem.html',
			replace: true,
			link: function(scope, element, attrs, controller) {
				if (attrs.firstLevel !== 'true') {
					scope.menuData = scope.menuData.subMenu;
				}
                scope.isInFavorite = function (title) {
                    if (!_.some($rootScope.$favoritesMenu, {name: title})) {
                        return true;
                    } else {
                        return false;
                    }
                };
                scope.addFavorite = function (title, url) {
                    var param = {id: session.getUserId(), name: title, url: url}
                    if (!_.some($rootScope.$favoritesMenu, {name: title})) {
                        lincUtil.enableConfirmPopup('Are you sure want to add this link your favorite menu ?', function()
                        {
                            favoriteMenuService.createFavoritesMenu(session.getUserId(), param).then(function (response) {
                                $rootScope.$favoritesMenu.push({name: title, url: url});
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                        });
                    }
                };
			}
		};
	}]);
});