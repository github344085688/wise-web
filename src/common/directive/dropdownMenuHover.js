'use strict';

define(['./directives'], function(directives) {
    directives.directive('dropdownMenuHover', function() {
        return {
            link: function(scope, elem) {
                if (typeof elem.dropdownHover == "function"){
                    elem.dropdownHover();
                }
            }
        };
    });
});
