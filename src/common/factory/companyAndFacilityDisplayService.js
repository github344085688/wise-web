/**
 * Created by Giroux on 2016/9/28.
 */

'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {

    factories.factory('companyAndFacilityDisplayService', function($resource, addressService) {
        var services = {};
        init();
        function init() {
            $resource('../../data/header/company_and_facility_header_display.json').query().$promise.then(function (response) {
                services.displayConfigs = response;
            });
        }

        services.getDisplayByStateName = function (stateName) {
            var displayConfigs = services.displayConfigs;
            var displayConfig = _.findLast(displayConfigs, function (config) {
                return stateName.indexOf(config.state) > -1;
            });
            if(displayConfig) {
                return displayConfig.display;
            } else {
                return ["facility", "company"];
            }
        };

        services.getDefaultCompanyFacility = function (cf, assignedCfs) {
            var defaultCf = cf;
            if(assignedCfs && assignedCfs.length > 0) {
                if (!defaultCf) {
                    defaultCf = assignedCfs[0];
                }
            }
            return defaultCf;
        };

        services.fillCityAndStateIntoName = function (assignedCompanyFacilities, cbFun) {
            var facilityIds = _.uniq(_.map(assignedCompanyFacilities, "facilityId"));
            var addressMap = {};
            addressService.searchAddressBasicInfo({orgIds: facilityIds,"wiseCompanyId": "across_all_companies"}).then(function (response) {
                if(response && response.length > 0) {
                    addressMap =  _.keyBy(response, 'organizationId');
                    _.forEach(assignedCompanyFacilities, function (cf) {
                        cf.facility.addressCity = addressMap[cf.facility.id].city;
                        cf.facility.addressState = addressMap[cf.facility.id].state;
                    });
                }
                cbFun()
            });
        };

        return services;
    });
});