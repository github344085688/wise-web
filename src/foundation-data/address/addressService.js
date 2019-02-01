'use strict';

define(['lodash'], function (_) {
    var addressService = function ($resource, session) {
        var service = {};
        service.getAddressById = function (addressId) {
            var entry = $resource("/fd-app/address/:id");
            return entry.get({id: addressId}).$promise;
        };

        service.remove = function (addressId) {
            var entry = $resource("/fd-app/address/:id");
            return entry.delete({id: addressId}).$promise;
        };

        service.enable = function (addressId) {
            var entry = $resource("/fd-app/address-enable/:id", null, {'enable': {method: 'PUT'}});
            return entry.enable({id: addressId}, null).$promise;
        };

        service.searchAddress = function (param) {
            var entry = $resource("/bam/address/search", null, {'postQuery': {method: 'POST', isArray: true}});
            return entry.postQuery(param).$promise;
        };

        service.searchAddressBasicInfo = function (param) {
            var entry = $resource("/fd-app/address/search", null, {'postQuery': {method: 'POST', isArray: true}});
            return entry.postQuery(param).$promise;
        };

        service.addAddress = function (address) {
            var entry = $resource("/fd-app/address");
            return entry.save(address).$promise;
        };

        service.addressImport = function (data) {
            var entry = $resource("/fd-app/address/batch-create", null, {'postQuery': {method: 'POST', isArray: true}});
            return entry.postQuery(data).$promise;
        };

        service.updateAddress = function (address) {
            var entry = $resource("/fd-app/address/:id", null, {'update': {method: 'PUT'}});
            return entry.update({id: address.id}, address).$promise;
        };

        service.getCurrentFacilityAddress = function () {
            return  service.searchAddress({"organizationId":session.getCompanyFacility().facilityId});
        };

        service.generageAddressData = function (data, addressExpression) {
            if(_.isEmpty(data)) return "";
            if (addressExpression) {
                return processExpression(_.replace(addressExpression, "\\n", "\n"), data);
            } else {
                var addressInfo =data.name+" - "
                if (data.address1) {
                    addressInfo += data.address1;
                }
                if (data.address2) {
                    addressInfo += " " + data.address2;
                }
                if (data.city) {
                    addressInfo += ", " + data.city;
                }
                if (data.state) {
                    addressInfo += ", " + data.state;
                }
                if (data.zipCode) {
                    addressInfo += " " + data.zipCode;
                }
                if (data.storeNo) {
                    addressInfo += " (" + data.storeNo + ")";
                }
                if (data.country) {
                    addressInfo += ", " + data.country;
                }
              
                return addressInfo;
            }
        };

        service.getAddressByZipCode = function (zipcode) {
            return $resource("/fd-app/auto-address-info/:zipcode").get({zipcode: zipcode}).$promise;
        };

        function processExpression(dataExpression, data) {
            for (var key in data) {
                dataExpression = _.replace(dataExpression, "{" + key + "}", data[key]);
            }
            return dataExpression;
        }
        return service;
    };
    addressService.$inject = ["$resource", "session"];
    return addressService;
});
