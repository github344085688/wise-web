'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function (factories, _, angular) {

    // Make sure the firebase app and firebase messaging js were load before this service
    factories.factory('firebaseService', function () {
        var service = {};

        service.setupMessageToken = function (callBack) {
            messaging.getToken()
                .then(function (currentToken) {
                    if (currentToken) {
                        callBack(currentToken);
                        //TODO send token to backend to register it.
                    } else {
                        requestPermission().then(function () {
                                service.setupMessageToken();
                            })
                            .catch(function (err) {
                                console.error('Unable to get permission to notify.', err);
                            });
                    }
                })
        };


        function requestPermission() {
            return messaging.requestPermission();
        }

        var config = {
            messagingSenderId: "2509753206"
        };
        firebase.initializeApp(config);
        var messaging = firebase.messaging();
        messaging.onTokenRefresh(service.setupMessageToken);

        service.getMessaging = function() {
            return messaging;
        };

        return service;

    });
});

