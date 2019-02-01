'use strict';

define(['./directives'], function (directives) {
    directives.directive('itemDisplay', ['moment', function (moment) {
        return {
            restrict: "AE",
            template: '<span title={{itemSpecTitle}}>{{itemDisplayName}}</span> ',
            scope: {
                item: '='
            },
            link: function(scope, element, attrs) {
                scope.$watchCollection('item', function(newNames, oldNames) {
                    if(!scope.item) return;
                    scope.itemSpec = {};
                    if(scope.item.name) {
                        scope.itemSpec = scope.item;
                    }else if(scope.item.itemSpecName) {
                        scope.itemSpec.name = scope.item.itemSpecName;
                        scope.itemSpec.desc = scope.item.itemSpecDesc;
                        scope.itemSpec.shortDescription = scope.item.shortDescription;
                    } else if(scope.item.itemName) {
                        scope.itemSpec.name = scope.item.itemName;
                        scope.itemSpec.desc = scope.item.itemDesc;
                        scope.itemSpec.shortDescription = scope.item.shortDescription;
                    }
                    scope.itemDisplayName = scope.itemSpec.name;
                    if (  scope.itemSpec.shortDescription && scope.itemSpec.desc) {
                        scope.itemDisplayName = scope.itemDisplayName + " (" + scope.itemSpec.shortDescription + ")";
                        scope.itemSpecTitle=scope.itemSpec.desc;
                    }else if(scope.itemSpec.shortDescription){
                        scope.itemDisplayName = scope.itemDisplayName + " (" + scope.itemSpec.shortDescription + ")";
                    }else if(scope.itemSpec.desc){
                        scope.itemDisplayName = scope.itemDisplayName + " (" + scope.itemSpec.desc + ")";
                    }

                });
            }
        };
    }]);
});
