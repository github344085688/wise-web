'use strict';

define([
	'./directives'
], function(directives) {
	directives.directive('popupMenu',
        function() {
            return {
                restrict: 'EAC',
                scope: {
                },
                link: function(scope, element, attrs) {
                    var openBtn = element.find('.menu-button');
                    var menuWrap = element.find('.menu-wrap');
                    var isOpen = false;
                    openBtn.on( "click", function() {
                        toggleMenu();
                    });
                    function toggleMenu() {
                        var btn = openBtn.children()[0];
                        if(isOpen) {
                            menuWrap.removeClass("show-menu");
                            openBtn.text("Show");
                        }
                        else {
                            menuWrap.addClass("show-menu");
                            openBtn.text("Hide");
                        }
                        isOpen = !isOpen;
                    }


                    element.on('click', '.dropdown', function (e) {
                        var currentEl = angular.element(this);
                        currentEl.addClass("open");
                    });
                    element.on('mouseover', '.dropdown', function (e) {
                        var currentEl = angular.element(this);
                        currentEl.addClass("open");
                    });
                    element.on('mouseout', '.dropdown', function (e) {
                        var currentEl = angular.element(this);
                        currentEl.removeClass("open");
                        currentEl.unbind("blur");
                    });
                }
            };
        }
	);
});