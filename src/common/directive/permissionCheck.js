'use strict';

define([
    './directives',
    'lodash'
], function(directives, _) {
    directives.directive('permissionCheck',['session', 'permissionCheckService', function(session, permissionCheckService) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                if(attrs.permissionCheck) {
                    var permissions = attrs.permissionCheck;
                    if(permissions) {
                        
                        if(!permissionCheckService.judgeIfHasPermission(permissions, session.getUserPermission())) {
                            element.hide();
                        }
                    }
                }
            }
        };
    }]);
});
