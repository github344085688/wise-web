/**
 * Created by Giroux on 2017/4/14.
 */

'use strict';

define(['lodash'], function(_) {
    var ssoController = function($scope, $q, $state, $location, $resource, userService, session, companyAndFacilityDisplayService, lincUtil) {

        $scope.loading = true;

        function gotoLoginPage() {
            location.href = linc.config.ssoRedirectLink;
        }

        function verifyToken(token) {
            session.setUserToken(token);

            userService.getUserIdByToken(token).then(function (res) {
                session.setUserId(res.idmUserId);

                session.getUserInfo().then(function (res) {
                    session.setAssignedCompanyFacilities(res.assignedCompanyFacilities);
                    var defaultCf = companyAndFacilityDisplayService.getDefaultCompanyFacility(res.defaultCompanyFacility, res.assignedCompanyFacilities);
                    session.setCompanyFacility(defaultCf);

                    companyAndFacilityDisplayService.fillCityAndStateIntoName(res.assignedCompanyFacilities, function () {
                        /** set company facility again once it fetch the facility addresses **/
                        session.setAssignedCompanyFacilities(_.sortBy(res.assignedCompanyFacilities, [function(cf){ return cf.facility.addressCity}, function(cf){ return cf.facility.addressState}]));
                        var defaultCf = companyAndFacilityDisplayService.getDefaultCompanyFacility(res.defaultCompanyFacility, res.assignedCompanyFacilities);
                        session.setCompanyFacility(defaultCf);
                    });
                    session.setSsoMark();

                    userService.getUserPermissions(res.idmUserId).then(function(permissions){
                        session.setUserPermission(_.map(permissions, 'name'));
                        $scope.loading = false;
                        $state.go('home');

                    }, function(err){
                        $scope.loading = false;
                        lincUtil.processErrorResponse(err);
                        gotoLoginPage();
                    });


                }, function () {
                    gotoLoginPage();
                });

            }, function () {
                gotoLoginPage();
            });
        }

        function getToken() {
            var token = $location.search().token;
            if (token) return token;

            var param = $location.$$hash;
            if (param) {
                var temp = param.split("#");
                param = temp[0];
                temp = param.split("=");

                if (temp[0] == "token" && temp.length == 2) {
                    token = temp[1];
                    return token;
                }
                return null;
            }

            return null;
        }

        function init() {
            var token = getToken();

            if (token) {
                verifyToken(token);
            } else {
                gotoLoginPage();
            }
        }

        init();
    };

    ssoController.$inject = ['$scope', '$q', '$state', '$location', '$resource', 'userService', 'session', 'companyAndFacilityDisplayService','lincUtil'];

    return ssoController;
});
