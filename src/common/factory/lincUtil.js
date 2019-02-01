'use strict';

define(['angular',
    './factories',
    'lodash'
], function (angular, factories, _) {
    factories.factory('lincUtil', ['$mdDialog', '$mdMedia', '$timeout', '$rootScope', '$http', '$q',
        function ($mdDialog, $mdMedia, $timeout, $rootScope, $http, $q) {

            var service = {};
            service.confirmPopup = function (title, message, fn) {
                var confirm = $mdDialog.confirm()
                    .title(title)
                    .textContent(message)
                    .ok('Yes')
                    .cancel('No');
                if (arguments.length > 3) {
                    $mdDialog.show(confirm).then(fn, arguments[3]);
                } else {
                    $mdDialog.show(confirm).then(fn);
                }
            };

            service.confirmPopupPromise = function (title, message) {
                var confirm = $mdDialog.confirm()
                    .title(title)
                    .textContent(message)
                    .ok('Yes')
                    .cancel('No');
                return $mdDialog.show(confirm);

            };

            service.deleteConfirmPopup = function (message, fn) {
                service.confirmPopup('Delete Confirm', message, fn);
            };
            service.disableConfirmPopup = function (message, fn) {
                service.confirmPopup('Disable Confirm', message, fn);
            };
            service.enableConfirmPopup = function (message, fn) {
                service.confirmPopup('Enable Confirm', message, fn);
            };

            service.errorPopup = function (message, fn) {
                if (message && message.data && message.data.error) {
                    message = message.data.error;
                }
                if (arguments.length > 1) {
                    service.messagePopup("Error", message, arguments[1]);
                } else {
                    service.messagePopup("Error", message);
                }
            };

            service.bufferErrorPopup = function (message, fn) {
                var textDecoder = new TextDecoder("utf-8");
                var unitArray = new Uint8Array(message.data);
                var errorString = textDecoder.decode(unitArray);
                message = JSON.parse(errorString).error;
                if (arguments.length > 1) {
                    service.messagePopup("Error", message, arguments[1]);
                } else {
                    service.messagePopup("Error", message);
                }
            };

            //params: fn (callback function)
            service.saveSuccessfulPopup = function () {
                if (arguments.length > 0) {
                    service.messagePopup("Message", "Save Successful.", arguments[0]);
                } else {
                    service.messagePopup("Message", "Save Successful.");
                }
            };

            service.updateSuccessfulPopup = function () {
                if (arguments.length > 0) {
                    service.messagePopup("Message", "Update Successful.", arguments[0]);
                } else {
                    service.messagePopup("Message", "Update Successful.");
                }
            };

            service.messagePopup = function (title, message) {
                var confirm = $mdDialog.alert()
                    .title(title)
                    .textContent(message)
                    .ok('OK');
                if (arguments.length > 2) {
                    $mdDialog.show(confirm).then(arguments[2]);
                } else {
                    $mdDialog.show(confirm);
                }
            };

            service.popupBodyPage = function (contolller, templateUrl, ev, params) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                return $mdDialog.show({
                    controller: contolller,
                    templateUrl: templateUrl,
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    locals: params
                });
            };

            service.popupImage = function (url) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                return $mdDialog.show({
                    template: "<div><img src=" + url + "></div>",
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                });
            };

            service.popUpWithHtml = function (msg, callback) {
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                return $mdDialog.show({
                    template: '<md-dialog style="height: 250px;min-width: 500px;">' +
                        '  <md-dialog-content style="margin:20px 20px 0px"><div style="height:40px;font-size:20px;border-bottom: 1px solid #eee;"><b>Message</b></div>' +
                        '<div style="height:135px;line-height:35px;font-size:17px">' + msg + '</div></md-dialog-content>' +
                        '  <md-dialog-actions>' +
                        '    <md-button ng-click="closeDialog()" class="md-primary">' +
                        '      OK' +
                        '    </md-button>' +
                        '  </md-dialog-actions>' +
                        '</md-dialog>',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen,
                    controller: function DialogController($scope, $mdDialog) {
                        $scope.closeDialog = function () {
                            $mdDialog.hide();
                            if(callback) {
                                callback();
                            }
                        }
                    }
                });
            };

            service.processErrorResponse = function (response) {
                service.errorPopup(service.getProcessErrorResponseMessage(response));
            };

            service.getProcessErrorResponseMessage = function (response) {
                var result = "";
                if (response.status && response.status === 400) {
                    result = "Bad Request, please adjust your request and try it again.";
                    if (response.error) {
                        result = response.error;
                    }
                    var err =  response.data ? response.data.data ? response.data.data : response.data : response.data
                    if (err) {
                        result = angular.fromJson(err).error;
                    }
                }
                if (response.status && response.status === 500) {
                    result = "Server Internal Error, Please call the admin to fix it.";
                    if (response.error) {
                        result = response.error;
                    }
                    var erData =   response.data ? response.data.data ? response.data.data : response.data : response.data
                    if (erData) {
                        var erroJson = angular.fromJson(erData).error;
                        if(erroJson){
                            if(erroJson.indexOf('"message"')>-1){
                                result =  angular.fromJson(erroJson).message
                            }
                            else{
                                result =  erroJson; 
                            }
                        } else {
                            if( erData.message) {
                                result =  erData.message;
                            }
                        }
                    }

                    erData = response.text 
                    if (erData) {
                        var erroJson = angular.fromJson(erData);
                        if( erroJson.message) {
                            result =  erroJson.message
                        }
                    }

                }
                if (response.status && response.status === 404) {
                    result = "Service you called is not found.";
                }
                if (response.status && response.status === 503) {
                    result = "Service is under system maintenance, please come back later.";
                }
                if (response.status && response.status === -1) {
                    result = "System connection time out, please try again later.";
                }
                return result;
            };

            service.formatError = function (msg) {
                return "Error: " + msg.data.error;
            };

            service.composeCompanyHeader = function (companyId) {
                var headers = {}
                if (companyId) {
                    headers = {
                        "WISE-Company-Id": companyId
                    }
                }
                return headers;
            };

            var timer;
            service.showErrorMsg = function (msg) {
                var errorMsg;
                if (msg.data != null && msg.data.error != null) {
                    errorMsg = msg.data.error;
                } else {
                    errorMsg = msg;
                }

                if (errorMsg.length > 150) {
                    errorMsg = 'Save failed! Please contact the administrator. ';
                }
                if (timer != null) {
                    $timeout.cancel(timer);
                }
                $rootScope.$$childTail.errorMsg = errorMsg;

                timer = $timeout(function () {
                    $rootScope.$$childTail.errorMsg = "";
                }, 5000);
                throw new Error(errorMsg);
            };

            service.extractOrganizationBasicField = function (organziations) {
                return _.flatMap(addsScacToOrganziations(organziations), "basic");
            };


            function addsScacToOrganziations(organziations){
    
                _.forEach(organziations,function(res){
                        if(res.scac){
                            res.basic.scac = res.scac;
                        }
                })
                return organziations;
            }

            service.extractOrganaizationName = function (organziations) {
                organziations.forEach(function (org) {
                    return org.name = org.basic.name;
                });
            };

            service.organizationFieldIsDisabledMap = function (fieldSettingObj, status, isItemLineLevel) {
                var isDisabledMap = {};
                angular.forEach(fieldSettingObj, function (obj, proName) {
                    if (!obj.status) return;
                    if ((isItemLineLevel && obj.isItemLineProperty) ||
                        (!isItemLineLevel && !obj.isItemLineProperty)) {
                        if (obj.isDisabled) {
                            isDisabledMap[proName] = obj.status.indexOf(status) > -1 ? true : false;
                        } else {
                            isDisabledMap[proName] = obj.status.indexOf(status) > -1 ? false : true;
                        }
                    }
                });
                return isDisabledMap;
            };

            service.exportFile = function (res, filename) {
                var octetStreamMime = 'application/octet-stream';
                var success = false;
                var headers = res.headers();
                var contentType = headers['content-type'] || octetStreamMime;

                try {
                    var blob = new Blob([res.data], {
                        type: contentType
                    });
                    if (navigator.msSaveBlob)
                        navigator.msSaveBlob(blob, filename);
                    else {
                        var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                        if (saveBlob === undefined) throw "Not supported";
                        saveBlob(blob, filename);
                    }
                    success = true;
                } catch (ex) {
                    // console.log("saveBlob method failed with the following exception:");
                }
                if (!success) {
                    var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    if (urlCreator) {
                        var link = document.createElement('a');
                        if ('download' in link) {
                            try {
                                var blob = new Blob([res.data], {
                                    type: contentType
                                });
                                var url = urlCreator.createObjectURL(blob);
                                link.setAttribute('href', url);
                                link.setAttribute("download", filename);
                                var event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                                link.dispatchEvent(event);
                                success = true;
                            } catch (ex) {
                                // console.log("Download link method with simulated click failed with the following exception:");
                            }
                        }
                        if (!success) {
                            try {
                                var blob = new Blob([res.data], {
                                    type: octetStreamMime
                                });
                                var url = urlCreator.createObjectURL(blob);
                                window.location = url;
                                success = true;
                            } catch (ex) {
                                //console.log("Download link method with window.location failed with the following exception:");
                            }
                        }
                    }
                }
                if (!success) {
                    window.open(httpPath, '_blank', '');
                }
            };

            service.getFile = function (fileId, authorization, callback) {
                var url = '/file-app/file-attachment-download/' + fileId;
                $http({
                    method: 'GET',
                    url: url,
                    responseType: 'arraybuffer',
                    headers: {
                        Authorization: authorization
                    }
                }).then(function (data) {
                    var headers = data.headers();
                    if (!headers) return;
                    var content = headers["content-disposition"];
                    if (!content) return;
                    var fileName = content.split(";")[1].split("=")[1];
                    if (callback) {
                        callback(fileName,data);
                    }
                }, function (data) {
                    service.errorPopup("Get File faild.");
                });
            };

            service.formatTimestampDuration = function (value) {
                if (!value) return;
                var theSecond = parseInt(value / 1000);
                var theMinute = 0;
                var theHour = 0;
                if (theSecond > 60) {
                    theMinute = parseInt(theSecond / 60);
                    theSecond = parseInt(theSecond % 60);

                    if (theMinute > 60) {
                        theHour = parseInt(theMinute / 60);
                        theMinute = parseInt(theMinute % 60);
                    }
                }
                var result = "";
                if (theMinute > 0) {
                    result = "" + parseInt(theMinute) + " min" + result;
                }
                if (theHour > 0) {
                    result = "" + parseInt(theHour) + " hour, " + result;
                }

                if (theMinute === 0 && theHour === 0) {
                    result = "" + theSecond + " seconds";
                }
                return result;
            };

            service.getCurrentDateAndTime = function () {
                var mouthLists = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                var weekdayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                var date = new Date();
                var mouth = mouthLists[date.getMonth()];
                var weekday = weekdayList[date.getDay()];
                var day = date.getDate();
                var year = date.getFullYear();
                var hour = date.getHours();
                var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                var second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                var currentTime = weekday + " " + mouth + " " + day + "," + year;
                var currentHMS = hour + ":" + minutes + ":" + second;
                return {
                    'currentTime': currentTime,
                    'currentHMS': currentHMS
                };
            };

            service.setPropetyToFalseAfterSeconds = function (object, field, seconds) {
                var seconds = seconds ? seconds : 3000;
                var timeoutPromise = $timeout(function () {
                    object[field] = false;
                    if (timeoutPromise) {
                        $timeout.cancel(timeoutPromise);
                    }
                }, seconds);
            };

            service.capitalAndAddSpaceBetweenCamelCase = function (text) {
                if (text) {
                    var toUpperCaseFirstStr = text.replace(/\b\w+\b/g, function (word) {
                        return word.substring(0, 1).toUpperCase() + word.substring(1);
                    });
                    var formatText = toUpperCaseFirstStr.match(/[A-Z]*[^A-Z]+/g);
                    return _.join(formatText, ' ');
                }
            };

            service.setFieldToNullIfNotExist = function (object, fieldName) {
                if (!object[fieldName]) {
                    object[fieldName] = null;
                }
            };

            service.getOrderedPromise = function(startPromise, nextPromise) {
                var defer = $q.defer();
                startPromise.then(function(data) {
                    defer.resolve(data);
                    nextPromise.then(function(data) {
                        defer.resolve(data)
                    }, function(err){
                        defer.reject(err);
                    });
                }, function(err){
                    defer.reject(err);
                });
                return defer.promise;
            };

            service.fomateStartDate = function(date){
                var mouthAndDay = getMouthAndDay(date);
                return date.getFullYear() + "-" + mouthAndDay.month + "-" + mouthAndDay.day + "T00:00:00";
            };

            service.fomateEndDate= function(date) {
                var mouthAndDay = getMouthAndDay(date);
                return date.getFullYear() + "-" + mouthAndDay.month + "-" + mouthAndDay.day + "T23:59:59";
            };

            function getMouthAndDay(date) {
                var month = date.getMonth() + 1;
                var day = date.getDate();
                if (month < 10) {
                    month = "0" + month;
                }
                if (day < 10) {
                    day = "0" + day;
                }
                return { month: month, day: day };
            }
            return service;
        }
    ]);
});