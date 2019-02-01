'use strict';

define([
	'lodash',
	'framework',
	'angular',
	'./directives'
], function(_, App, angular, directives) {
	directives.directive('sidebarMenu', ['$document', '$location', '$timeout', 
		function($document, $location, $timeout) {
		return {
            restrict: 'EAC',
			scope: {
				moduleName: '@'
			},
			templateUrl: 'common/directive/template/sidebarMenu.html',
			replace: true,
			link: function(scope, element, attrs, controller) {
				var resBreakpointMd = App.getResponsiveBreakpoint('md');
                var autoScroll = attrs.autoScroll === 'true';
                var slideSpeed = parseInt(attrs.slideSpeed);
                var keepExpand = attrs.keepExpand === 'true';

				var handleSidebarAndContentHeight = function () {
		            var content = $document.find('.page-content');
		            var sidebar = $document.find('.page-sidebar');
		            var header = $document.find('.page-header');
		            var footer = $document.find('.page-footer');
		            var body = $document.find('body');
		            var height;

		            if (body.hasClass("page-footer-fixed") === true && body.hasClass("page-sidebar-fixed") === false) {
		                var available_height = App.getViewPort().height - footer.outerHeight() - header.outerHeight();
		                if (content.height() < available_height) {
		                    content.attr('style', 'min-height:' + available_height + 'px');
		                }
		            } else {
		                if (body.hasClass('page-sidebar-fixed')) {
		                    height = _calculateFixedSidebarViewportHeight();
		                    if (body.hasClass('page-footer-fixed') === false) {
		                        height = height - footer.outerHeight();
		                    }
		                } else {
		                    var headerHeight = header.outerHeight();
		                    var footerHeight = footer.outerHeight();

		                    if (App.getViewPort().width < resBreakpointMd) {
		                        height = App.getViewPort().height - headerHeight - footerHeight;
		                    } else {
		                        height = sidebar.height() + 20;
		                    }

		                    if ((height + headerHeight + footerHeight) <= App.getViewPort().height) {
		                        height = App.getViewPort().height - headerHeight - footerHeight;
		                    }
		                }
		                content.attr('style', 'min-height:' + height + 'px');
		            }
		        };

			    var _calculateFixedSidebarViewportHeight = function () {
			        var sidebarHeight = App.getViewPort().height - $document.find('.page-header').outerHeight(true);
			        if ($document.find('body').hasClass("page-footer-fixed")) {
			            sidebarHeight = sidebarHeight - $document.find('.page-footer').outerHeight();
			        }

			        return sidebarHeight;
			    };

				element.on('click', 'li > a.nav-toggle, li > a > span.nav-toggle', function (e) {
	                var that = angular.element(this).closest('.nav-item').children('.nav-link');

	                if (App.getViewPort().width >= resBreakpointMd && !element.find('.page-sidebar-menu').attr("data-initialized") && $document.find('body').hasClass('page-sidebar-closed') &&  that.parent('li').parent('.page-sidebar-menu').size() === 1) {
	                    return;
	                }

	                var hasSubMenu = that.next().hasClass('sub-menu');

	                if (App.getViewPort().width >= resBreakpointMd && that.parents('.page-sidebar-menu-hover-submenu').size() === 1) { // exit of hover sidebar menu
	                    return;
	                }

	                if (hasSubMenu === false) {
	                    if (App.getViewPort().width < resBreakpointMd && element.find('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
	                        element.find('.page-header .responsive-toggler').click();
	                    } else {
                            that.parent().addClass('active');
                            _.forEach(element.find('li.active'), function (li) {
                            	var pli = angular.element(li);
                            	if (pli.find("li").length > 0) return;

								if (pli.find("a").attr("href") !== that.parent().find("a").attr("href")) {
                                    pli.removeClass('active');
								}
                            })
                        }
	                    return;
	                }

	                if (that.next().hasClass('sub-menu always-open')) {
	                    return;
	                }

	                var parent =that.parent().parent();
	                var the = that;
	                var menu = element.find('.page-sidebar-menu');
	                var sub = that.next();
	                
	                if (!keepExpand) {
	                    parent.children('li.open').children('a').children('.arrow').removeClass('open');
	                    parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
	                    parent.children('li.open').removeClass('open');
	                }

	                var slideOffeset = -200;

	                if (sub.is(":visible")) {
	                    the.find('.arrow').removeClass("open");
	                    the.parent().removeClass("open");
	                    sub.slideUp(slideSpeed, function () {
	                        if (autoScroll === true && $document.find('body').hasClass('page-sidebar-closed') === false) {
	                            if ($document.find('body').hasClass('page-sidebar-fixed')) {
	                                menu.slimScroll({
	                                    'scrollTo': (the.position()).top
	                                });
	                            } else {
	                                App.scrollTo(the, slideOffeset);
	                            }
	                        }
	                        // handleSidebarAndContentHeight();
	                    });
	                } else if (hasSubMenu) {
	                    the.find('.arrow').addClass("open");
	                    the.parent().addClass("open");
	                    sub.slideDown(slideSpeed, function () {
	                        if (autoScroll === true && $document.find('body').hasClass('page-sidebar-closed') === false) {
	                            if ($document.find('body').hasClass('page-sidebar-fixed')) {
	                                menu.slimScroll({
	                                    'scrollTo': (the.position()).top
	                                });
	                            } else {
	                                App.scrollTo(the, slideOffeset);
	                            }
	                        }
	                        // handleSidebarAndContentHeight();
	                    });
	                }

	                e.preventDefault();
	            });

                element.on("click", ".page-sidebar-menu li > a", function(e) {
                    if (App.getViewPort().width < resBreakpointMd && element.find(this).next().hasClass('sub-menu') === false) {
                        element.find('.page-header .responsive-toggler').click();
                    }
                });

				var handleSidebarMenuActiveLink = function(mode, el) {
		            var url = $location.url().toLowerCase();    
		            var menu = element.find('.page-sidebar-menu');

		            if (menu.children().length == 0) {
		            	setTimeout(function () {
                            handleSidebarMenuActiveLink(mode, el);
                        }, 100);
		            	return;
					}

		            if (mode === 'click' || mode === 'set') {
		                el = angular.element(el);
		            } else if (mode === 'match') {
		                menu.find("li > a").each(function() {
		                	var currentEl = angular.element(this);
		                    var path = currentEl.attr("href").toLowerCase();       
		                    // url match condition         
		                    if (path.length > 1 && url == path.substr(1)) {
		                        el = currentEl;
		                        return; 
		                    }
		                });
		            }

		            if (!el || el.size() === 0) {
		                return;
		            }

		            if (el.attr('href').toLowerCase() === '#') {
		                return;
		            }        

		            // disable active states
		            menu.find('li.active').removeClass('active');
		            menu.find('li > a > .selected').remove();

		            if (menu.hasClass('page-sidebar-menu-hover-submenu') === false) {
		                menu.find('li.open').each(function(){
		            		var currentEl = angular.element(this);
		                    if (currentEl.children('.sub-menu').size() === 0) {
		                        currentEl.removeClass('open');
		                        currentEl.find('> a > .arrow.open').removeClass('open');
		                    }                             
		                }); 
		            } else {
		                 menu.find('li.open').removeClass('open');
		            }

		            el.parents('li').each(function () {
		            	var currentEl = angular.element(this);
		                currentEl.addClass('active');
		                currentEl.find('> a > span.arrow').addClass('open');

		                if (currentEl.parent('ul.page-sidebar-menu').size() === 1) {
		                    currentEl.find('> a').append('<span class="selected"></span>');
		                }
		                
		                if (currentEl.children('ul.sub-menu').size() === 1) {
		                    currentEl.addClass('open');
		                }
		            });

		            if (mode === 'click') {
		                if (App.getViewPort().width < resBreakpointMd && element.find('.page-sidebar').hasClass("in")) { // close the menu on mobile view while laoding a page 
		                    $document.find('.page-header .responsive-toggler').click();
		                }
		            }
		        };

				scope.$root.$on('$stateChangeSuccess', function() {
	                handleSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu   
	            });

	            $timeout(function() {
	                handleSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu  
	            }, 100);
			},
			controller: ['$rootScope', '$scope', 'lincResourceFactory', 'session', function($rootScope, $scope, lincResourceFactory, session) {
				$scope.menuData = [];
				var filterMenuByRole = function(menus, roles) {
					return _.filter(menus, function(menu) {
						if (!menu.roles || _.difference(menu.roles, roles).length < _.uniq(menu.roles, roles).length) {
							if (menu.subMenu) {
								menu.subMenu = filterMenuByRole(menu.subMenu, roles);
								return menu.subMenu.length > 0;
							}
							return true;
						}

						return false;
					});
				};

				lincResourceFactory.getMenu($scope.moduleName).then(function(data) {
					session.getUserInfo().then(function(userInfo) {
						$scope.menuData = data;
					});
				});
			}]
		};
	}]);
});