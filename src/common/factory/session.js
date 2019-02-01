'use strict';

define([
    './factories',
    'lodash'
], function (factories, _) {
    factories.factory('session', function (userService, $cookies, $q) {
        var service = {},
            _sessionInfo = {};
        userService.session = service;

        service.getUserInfo = function () {
            var defer = $q.defer();
            if (_sessionInfo.userInfo) {
                return $q.resolve(_sessionInfo.userInfo);
            } else if (service.getUserId() !== undefined) {
                return userService.getUserDetailById(service.getUserId()).then(function (res) {
                    service.setUserInfo(res);
                    return res;
                });
            } else {
                $q.resolve(undefined);
            }
            return defer.promise;
        };


        service.getCompanyIdsByFacilityId = function (facilityId) {
            var companyIds = [];
            _.forEach(service.getAssignedCompanyFacilities(), function (companyFacility) {
                if (companyFacility.facilityId == facilityId) {
                    companyIds.push(companyFacility.companyId);
                }
            });
            return companyIds;
        };

        service.setUserInfo = function (userInfo) {
            setSessionData("userInfo", userInfo);
        };

        service.getUserId = function () {
            return getSessionData("userId") || getFromStorageAndSetToSessionDataIfExist("userId", false);
        };

        service.setUserId = function (userId) {
            setSessionData("userId", userId);
            if (Storage !== "undefined") {
                setToStorage("userId", userId, false);
            }
        };

        service.getUserToken = function () {
            return getSessionData("token") || getFromStorageAndSetToSessionDataIfExist("token", false)
        };

        service.setUserToken = function (token) {
            setSessionData("token", token);
            if (Storage !== "undefined") {
                setToStorage("token", token, false);
            }
        };

        service.getSsoMark = function () {
            return getSessionData("ssoMark") || getFromStorageAndSetToSessionDataIfExist("ssoMark", false)
        };

        service.setSsoMark = function () {
            setSessionData("ssoMark", "sso");
            if (Storage !== "undefined") {
                setToStorage("ssoMark", "sso", false);
            }
        };

        service.getMenuMark = function () {
            return getSessionData("menuMark") || getFromStorageAndSetToSessionDataIfExist("menuMark", false)
        };

        service.setMenuMark = function (mark) {
            setSessionData("menuMark", mark);
            if (Storage !== "undefined") {
                setToStorage("menuMark", mark, false);
            }
        };

        service.getUserPermission = function () {
            return getSessionData("userPermissions") || getFromStorageAndSetToSessionDataIfExist("userPermissions", true);
        };

        service.setUserPermission = function (userPermissions) {
            setSessionData("userPermissions", userPermissions);
            if (Storage !== "undefined") {
                setToStorage("userPermissions", userPermissions, true);
            }
        };

        service.getUserViewSetting = function () {
            return getSessionData("viewSetting") || getFromStorageAndSetToSessionDataIfExist("viewSetting", true);
        };

        service.setUserViewSetting = function (viewSetting) {
            setSessionData("viewSetting", viewSetting);
            if (Storage !== "undefined") {
                setToStorage("viewSetting", viewSetting, true);
            }
        };

        service.getCompanyFacility = function () {
            return getSessionData("companyFacility") || getFromStorageAndSetToSessionDataIfExist("companyFacility", true)
        };

        service.setCompanyFacility = function (companyFacility) {
            setSessionData("companyFacility", companyFacility);
            if (Storage !== "undefined") {
                setToStorage("companyFacility", companyFacility, true);
            }
        };

        service.getAssignedCompanyFacilities = function () {
            return getSessionData("assignedCompanyFacilities") || getFromStorageAndSetToSessionDataIfExist("assignedCompanyFacilities", true)
        };

        service.setAssignedCompanyFacilities = function (assignedCompanyFacilities) {
            setSessionData("assignedCompanyFacilities", assignedCompanyFacilities);
            if (Storage !== "undefined") {
                setToStorage("assignedCompanyFacilities", assignedCompanyFacilities, true);
            }
        };

        service.clean = function () {
          
            _sessionInfo = {};
            if (Storage !== "undefined") {
                var viewSetting = service.getUserViewSetting()
                localStorage.clear();
                service.setUserViewSetting(viewSetting)
            }
        };


        function getFromStorageAndSetToSessionDataIfExist(key, storedAsObject) {
            if (storedAsObject) {
                if (localStorage.getItem(key) !== null) {
                    setSessionData(key, getItemFromStorage(key));
                    return getSessionData(key)
                } else {
                    return null;
                }
            } else {
                if (localStorage[key]) {
                    setSessionData(key, localStorage[key]);
                    return getSessionData(key);
                } else {
                    return null;
                }
            }
        }

        function setToStorage(key, value, storedAsObject) {
            if (storedAsObject)
                setItemToStorage(key, value, true);
            else
                localStorage[key] = value;
        }


        function setSessionData(key, value) {
            _sessionInfo[key] = value;
        }

        function getSessionData(key) {
            return _sessionInfo[key];
        }


        function removeSessionData(key) {
            _sessionInfo[key] = undefined;
        }

        function setItemToStorage(key, value) {
            if (value) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        }

        function getItemFromStorage(key) {
            var item = localStorage.getItem(key);

            if (item !== null && typeof item === 'string') {
                var itemValue = null;
                try {
                    itemValue = JSON.parse(item);
                } catch (err) {}
                return itemValue;
            } else {
                return item;
            }
        }

        return service;
    });
});