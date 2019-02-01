'use strict';

define([
    './factories',
    'lodash'
], function (factories, _) {
    factories.factory('tokenInterceptor', function ($q, $injector) {

        function getCompanyFacilityDisplayConfig() {
            var companyAndFacilityDisplayService = $injector.get('companyAndFacilityDisplayService');
            var $state = $injector.get('$state');
            return companyAndFacilityDisplayService.getDisplayByStateName($state.current.name);
        }

        return {
            request: function (config) {
                var session = $injector.get('session');
                if (config.url.indexOf("jira") < 0) {
                    config.headers.Authorization = session.getUserToken();
                }
                var sessionCompanyFacility = session.getCompanyFacility();
                if (!config.headers["WISE-Company-Id"]) {
                    if (config.data && config.data.wiseCompanyId) {
                        config.headers["WISE-Company-Id"] = config.data.wiseCompanyId;
                    } else if (sessionCompanyFacility && getCompanyFacilityDisplayConfig().indexOf("company") > -1) {
                        config.headers["WISE-Company-Id"] = sessionCompanyFacility.companyId;
                    } else if (sessionCompanyFacility) {
                        config.headers["WISE-Company-Id"] = session.getCompanyIdsByFacilityId(sessionCompanyFacility.facilityId).join(",");
                    }
                }
                if(sessionCompanyFacility &&  getCompanyFacilityDisplayConfig().indexOf("facility") > -1) {
                    config.headers["WISE-Facility-Id"] = sessionCompanyFacility.facilityId;
                }

                if (config.url.startsWith("/fd-app/") || config.url.startsWith("/idm-app/") ||
                    config.url.startsWith("/print-app/") || config.url.startsWith("/file-app/") || config.url.startsWith("/push-app/")) {
                    config.url =  linc.config.contextPath + "/shared" + config.url;
                } else if (config.url.startsWith("/bam/")
                    || config.url.startsWith("/base-app/")
                    || config.url.startsWith("/wms-app/")
                    || config.url.startsWith("/yms-app/")
                    || config.url.startsWith("/report-center/")
                    || config.url.startsWith("/inventory-app/")
                    || config.url.startsWith("/message-handler-app/")
                ) {
                    var contextPath = linc.config.contextPath;
                    if (config.data && config.data.facilityAccessUrl) {
                        config.url = contextPath +  "/" + config.data.facilityAccessUrl + config.url;
                    } else if (sessionCompanyFacility) {
                        config.url = contextPath +  "/" + sessionCompanyFacility.facility.accessUrl + config.url;
                    }
                } else if (config.url.endsWith(".json") && (config.url.indexOf("/data/") > -1)){
                    config.url = config.url.replace(/\/data/, linc.config.contextPath + "/data");

                }
                return config;
            },
            responseError: function (response) {
                if (response.status == 401) {
                    var $state = $injector.get('$state');
                    var session = $injector.get('session');
                    session.clean();

                    if (location.hash.indexOf("/sso#") < 0) {
                        $state.go('login');
                    }
                }
                return $q.reject(response);
            }
        };
    });
});
