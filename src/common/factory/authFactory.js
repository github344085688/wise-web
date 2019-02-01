'use strict';

define([
	'./factories',
	'lodash'
], function(factories,_) {
	factories.factory('authFactory', function($q, $http, $resource, lincUtil,
									userService, session, companyAndFacilityDisplayService) {
		var services = {};
		var loginEntry = $resource('/idm-app/user/login', null , {'login': {method : 'POST'}});
		services.signIn = function(userName, password, fn) {
			return loginEntry.login({username:userName, password: password, channel:"Web", returnUserPermissions: ["WEB"]}).$promise.then(function(res){
				if(res.success){
					$http.defaults.headers.common.user = userName;
					session.setUserToken(res.oAuthToken);
					session.setUserId(res.idmUserId);
					session.setUserPermission(_.map(res.userPermissions, 'name'));
					setUserAndCompanyFacilityToSession(res.idmUserId, function () {
						if(fn) fn();
					});
				}else {
					var errMessage = res.errorMessage ? res.errorMessage : "Login Failed!";
					lincUtil.errorPopup(errMessage);
				}
			}, function(err){
			    if(err.status == 401) {
					lincUtil.errorPopup("Username or password incorrect.");
				}else {
					lincUtil.errorPopup("Internal Server Error, please contact IT.");
				}
			});
		};

		function setUserAndCompanyFacilityToSession(userId, cbFun) {
			userService.getUserDetailById(userId).then(function(res){
				session.setUserInfo(res);
				var defaultCf = companyAndFacilityDisplayService.getDefaultCompanyFacility(res.defaultCompanyFacility, res.assignedCompanyFacilities);
				session.setCompanyFacility(defaultCf);
				session.setAssignedCompanyFacilities(res.assignedCompanyFacilities);
                companyAndFacilityDisplayService.fillCityAndStateIntoName(res.assignedCompanyFacilities, function () {
					session.setAssignedCompanyFacilities(_.sortBy(res.assignedCompanyFacilities, [function(cf){ return cf.facility.addressCity}, function(cf){ return cf.facility.addressState}]));
                    var defaultCf = companyAndFacilityDisplayService.getDefaultCompanyFacility(res.defaultCompanyFacility, res.assignedCompanyFacilities);
                    session.setCompanyFacility(defaultCf);
                    cbFun();
                });
			}, function(err){
				lincUtil.errorPopup("Internal Server Error, please contact IT.");
			});
		}

		services.signOut = function() {
            $resource("/idm-app/user/logout").save({oauthToken:session.getUserToken()}).$promise.then(function (res) {
                session.clean();
            }, function (error) {
                session.clean();
            });
		};

		services.isSignIn = function() {
			return session.getUserId();
		};

		return services;
	});
});