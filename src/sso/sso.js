/**
 * Created by Giroux on 2017/4/14.
 */

'use strict';

define([
    'angular',
    'src/sso/ssoController',
    'src/sso/ssoLandingController'
], function(angular, ssoController, ssoLandingController) {
    angular.module('linc.sso', [])
        .controller('SsoController', ssoController)
        .controller('SsoLandingController', ssoLandingController);

});