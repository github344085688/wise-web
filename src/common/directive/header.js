'use strict';

define([
	'lodash',
	'angular',
	'./directives',
	'src/module-config'
], function (_, angular, directives, moduleConfig) {
	directives.directive('header',
        ['$document', '$state', 'session', 'authFactory', 'organizationService', 'companyAndFacilityDisplayService', '$rootScope', 'favoriteMenuService', 'lincUtil',
            function ($document, $state, session, authFactory, organizationService, companyAndFacilityDisplayService, $rootScope, favoriteMenuService, lincUtil) {
				return {
					templateUrl: 'common/directive/template/header.html',
					link: function (scope, element, attrs, controller) {
						var locationPath;
						function init() {
							locationPath = location.hash;
                            getFavoriteMenu();
						}
						init();

						scope.signOut = function () {
							if (session.getSsoMark() == "sso") {
								session.clean();
								location.href = linc.config.ssoRedirectLink + "?slo=true";
								return;
							}

							authFactory.signOut();
							$state.go('login');
						};

						scope.isHomePage = function () {
							if ($state.current.name == "home") return true;
							return false;
						};

						scope.isShowMenuBtn = function () {
							if ($state.current.name == "home") return false;
							if ($state.current.name == "system.feedback") return false;
							if ($state.current.name == "gis.resources") return false;
							if ($state.current.name == "gis.setup") return false;

							var mark = session.getMenuMark();
							if (mark != "hide") return false;

							return true;
						};

						scope.isShowCloseMenuBtn = function () {
							if ($state.current.name == "home") return false;
							if ($state.current.name == "system.feedback") return false;
							if ($state.current.name == "gis.resources") return false;
							if ($state.current.name == "gis.setup") return false;

							if (locationPath != location.hash) {
								session.setMenuMark("show");
								locationPath = location.hash;
								return true;
							}

							var mark = session.getMenuMark();
							if (mark == "hide") return false;

							return true;
						};

						scope.showMenu = function () {
							session.setMenuMark("show");
						};

						scope.hideMenu = function () {
							session.setMenuMark("hide");
						};

						scope.menuName = function () {
							var module = _.find(scope.modules, function (module) {
								return module.name == $state.current.name
									|| $state.current.name.indexOf(module.name + ".") == 0;
							});
							if (module) {
								return module.label;
							}
							return "Home Menu";
						};

						session.getUserInfo().then(function (userInfo) {
							scope.user = angular.copy(userInfo);
							var userRoles = _.map(userInfo.roles, 'name');
							scope.modules = _.filter(moduleConfig, function (module) {
								return module.label && (!module.roles || _.difference(module.roles, userRoles).length < _.uniq(module.roles, userRoles).length);
							});
							setCompanyAndFacilityDisplay(null, $state.current);
						});

						$rootScope.$watch("$favoritesMenu");

						$rootScope.$on('$stateChangeStart', setCompanyAndFacilityDisplay);
						function setCompanyAndFacilityDisplay(event, toState) {
							if (!scope.user) return;
							var cfShowLabel = getCfShowLabel(toState);
							$rootScope.cfShowLabel = cfShowLabel;
							if (!cfShowLabel) return;
							scope.currentCompanyFacility = session.getCompanyFacility();
							if (cfShowLabel == "companyfacility") {
								scope.companyFacilities = session.getAssignedCompanyFacilities();
							} else {
								scope.companyFacilities = getCfSelectOptions(cfShowLabel);
								setCurrentCfIntoOptionsByCfShowLabel(cfShowLabel);
							}
						}

						function setCurrentCfIntoOptionsByCfShowLabel(cfShowLabel) {
							_.forEach(scope.companyFacilities, function (cf, key) {
								if (cf[cfShowLabel].id == scope.currentCompanyFacility[cfShowLabel].id) {
									scope.companyFacilities[key] = scope.currentCompanyFacility;
								}
							});
						}

						function getCfSelectOptions(type) {
							var companyFacilities = session.getAssignedCompanyFacilities();
							return _.uniqWith(companyFacilities, function (cf1, cf2) {
								return (cf1[type].id == cf2[type].id)
							});
						}

						function getCfShowLabel(toState) {
							var displayConfig = companyAndFacilityDisplayService.getDisplayByStateName(toState.name);
							if (displayConfig.indexOf("facility") > -1 && displayConfig.indexOf("company") > -1) {
								return "companyfacility";
							} else if (displayConfig.indexOf("company") > -1) {
								return "company";
							} else if (displayConfig.indexOf("facility") > -1) {
								return "facility";
							} else {
								null;
							}
						}

						function isChangeCurrentCompanyFacility(cf, currentCf, cfShowLabel) {
							var bool;
							if (cfShowLabel == "company") {
								bool = (cf.companyId == currentCf.companyId) ? false : true;
							} else if (cfShowLabel == "facility") {
								bool = (cf.facilityId == currentCf.facilityId) ? false : true
							} else if (cfShowLabel == "companyfacility") {
								bool = (cf.companyId == currentCf.companyId &&
									cf.facilityId == currentCf.facilityId) ? false : true;
							}
							return bool;
						}

						scope.onClickCompanyFacility = function (cf) {
							if (isChangeCurrentCompanyFacility(cf, scope.currentCompanyFacility, $rootScope.cfShowLabel)) {
								session.setCompanyFacility(cf);
								scope.currentCompanyFacility = cf;
								var current = $state.current.name;
								//gis切换仓库不跳转页面
								if (!_.startsWith(current, "gis")) {
									$state.go('home');
								}
							}
						};

						// Handles the horizontal menu
						var handleHorizontalMenu = function ($element) {

							element.find('.top-menu').on('click', '.dropdown-user', function (e) {
								var currentEl = angular.element(this);
								currentEl.addClass("open");
							});
							element.find('.top-menu').on('mouseover', '.dropdown-user', function (e) {
								var currentEl = angular.element(this);
								currentEl.addClass("open");
							});

							element.find('.top-menu').on('mouseout', '.dropdown-user', function (e) {
								var currentEl = angular.element(this);
								currentEl.removeClass("open");
								currentEl.unbind("blur");
							});


							//handle tab click
							element.find('.page-header').on('click', '.hor-menu a[data-toggle="tab"]', function (e) {
								e.preventDefault();
								var nav = element.find(".hor-menu .nav");
								var active_link = nav.find('li.current');
								element.find('li.active', active_link).removeClass("active");
								element.find('.selected', active_link).remove();
								var new_link = angular.element(this).parents('li').last();
								new_link.addClass("current");
								new_link.find("a:first").append('<span class="selected"></span>');
							});

							// handle search box expand/collapse
							element.find('.page-header').on('click', '.search-form', function (e) {
								var currentEl = angular.element(this);
								currentEl.addClass("open");
								currentEl.find('.form-control').focus();

								element.find('.page-header .search-form .form-control').on('blur', function (e) {
									currentEl.closest('.search-form').removeClass("open");
									currentEl.unbind("blur");
								});
							});

							// handle hor menu search form on enter press
							element.find('.page-header').on('keypress', '.hor-menu .search-form .form-control', function (e) {
								if (e.which == 13) {
									angular.element(this).closest('.search-form').submit();
									return false;
								}
							});

							// handle header search button click
							element.find('.page-header').on('mousedown', '.search-form.open .submit', function (e) {
								e.preventDefault();
								e.stopPropagation();
								angular.element(this).closest('.search-form').submit();
							});

							// handle hover dropdown menu for desktop devices only
							$document.find('[data-hover="megamenu-dropdown"]').not('.hover-initialized').each(function () {
								angular.element(this).dropdownHover();
								angular.element(this).addClass('hover-initialized');
							});

							$document.on('click', '.mega-menu-dropdown .dropdown-menu', function (e) {
								e.stopPropagation();
							});
						};

                        function getFavoriteMenu() {
                            favoriteMenuService.getFavoritesMenu(session.getUserId()).then(function (response) {
                                $rootScope.$favoritesMenu=response;
                            }, function (error) {
                            });
                        }

                        scope.removeFavorite = function (favorite, index) {
                            var param = {name: favorite.name}
                            lincUtil.enableConfirmPopup('Are you sure want to remove this link from your favorite menu ?', function()
                            {
                                favoriteMenuService.removeFavoritesMenu(session.getUserId(), param).then(function (response) {
                                    $rootScope.$favoritesMenu.splice(index, 1);
                                }, function (error) {
                                    lincUtil.processErrorResponse(error);
                                });
                            });
                        };
						handleHorizontalMenu(element);
					}
				};
			}]);
});