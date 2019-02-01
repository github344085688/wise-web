'use strict';

define([
    './factories',
    'lodash'
], function (factories, _) {
    factories.factory('userService', function ($q, $resource, $injector, lincUtil, facilityService, companyService) {

        var service = {};

        function getFacilityId() {
            var facilityId = "";
            if (location.hash.indexOf("user-management") > 0) {
                return facilityId;
            }
            if (service.session) {
                var sessionCompanyFacility = service.session.getCompanyFacility();
                if (sessionCompanyFacility) {
                    facilityId = sessionCompanyFacility.facilityId
                }
            }
            return facilityId;
        }

        service.autoCompleteQuery = function (keyword) {
            return $resource('/idm-app/user/search', null, { 'search': { method: 'POST', isArray: true } }).search({ "username": keyword, "facilityId": getFacilityId()}).$promise;
        };

        service.searchUsers = function (param) {
            if (param) {
                param.facilityId = getFacilityId();
            }
            return $resource('/idm-app/user/search', null, { 'search': { method: 'POST', isArray: true } }).search(param).$promise;
        };

        service.remove = function (tagId) {
            return $resource("/idm-app/tag/:tagId").delete({ tagId: tagId }).$promise;
        };

        service.save = function (user) {
            return $resource('/idm-app/user').save(user).$promise;
        };

        service.update = function (user) {
            return $resource('/idm-app/user/:userId', null, { 'update': { method: 'PUT' } }).update({ userId: user.idmUserId }, user).$promise;
        };

        service.getUserById = function (userId) {
            return $resource('/idm-app/user/:id').get({ id: userId }).$promise;
        };

        service.getUserIdByToken = function (token) {
            var param = {
                requestedEndpoint: "",
                token: token
            };
            return $resource("/idm-app/user/authorize", {}, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.getUserDetailById = function (userId) {
            var deffered = $q.defer();
            service.getUserById(userId).then(function (res) {
                service.setUserCompanyFacilityObjsInfoById(res.defaultCompanyFacility,
                    res.assignedCompanyFacilities, function () {
                    deffered.resolve(res);
                });
            }, function (error) {
                deffered.reject(error);
            });
            return deffered.promise;
        };

        service.getUserPermissions = function (userId) {
            return  $resource("/idm-app/user/:idmUserId/permission", {idmUserId: userId}, { 'search': { 'method': 'POST',  isArray: true } }).search(["WEB","ALL"]).$promise
        };

        service.setUserCompanyFacilityObjsInfoById = function (defaultCf, assignedCfs, cbFun) {
            var companyIds = _.uniq(_.map(assignedCfs, "companyId"));
            var facililtyIds = _.uniq(_.map(assignedCfs, "facilityId"));
            var promises = [];
            promises.push(facilityService.searchFacility({ ids: facililtyIds }));
            promises.push(companyService.searchCompany({ ids: companyIds }));
            $q.all(promises).then(function (response) {
                var orgs = _.concat(response[0], response[1]);
                lincUtil.extractOrganaizationName(orgs);
                var orgsMap = _.keyBy(orgs, function (o) { return o.id; });
                _.forEach(assignedCfs, function (cf) {
                    setCompanyFacilityObjInfoById(cf, orgsMap);
                });
                setCompanyFacilityObjInfoById(defaultCf, orgsMap);
                cbFun();
            }, function(err){
                lincUtil.processErrorResponse(err);
            });
        };

        service.validateSsoUseName = function (ssoUsername) {
            return $resource("/idm-app/user/sso-username/:ssoUsername/validate").get({ ssoUsername: ssoUsername }).$promise;
        };

        function setCompanyFacilityObjInfoById(cf, orgsMap) {
            if (!cf) return;
            if (cf.companyId) {
                cf.company = orgsMap[cf.companyId];
            }
            if (cf.facilityId) {
                cf.facility = orgsMap[cf.facilityId];
            }
        }

        service.searchUserWithPickTaskStatistics = function(param){
            return $resource('/bam/idm/user/search-user-with-pick-task-statistics', null, { 'search': {
                method: 'POST',
                isArray: true
            }}).search(param).$promise;
        };

        service.searchInvoiceCustomer = function (param) {
            return $resource('/report-center/billing/call-bill-pay-api', null, { 'search': { method: 'POST'} }).search(param).$promise;
        };

        return service;
    });
});
