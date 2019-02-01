'use strict';

define([
    'lodash',
    './directives'
], function (_, directives) {
    directives.directive('authRoles', ['session', function (session) {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                var roles = attrs.authRoles.split(',');
                session.getUserInfo().then(function (userInfo) {
                    scope.user = { username: userInfo.username };

                    var userRoles = _.map(userInfo.roles, 'name');
                    if (!roles || _.difference(roles, userRoles).length < _.uniq(roles, userRoles).length) {
                        elem.show();
                    } else {
                        elem.hide();
                    }
                });
            }
        };
    }]);
});