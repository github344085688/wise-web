'use strict';

define(['./directives'], function (directives) {
    directives.directive('httpSrc', ['$resource', '$http', 'lincUtil', function ($resource, $http, lincUtil) {
        return {
            // do not share scope with sibling img tags and parent
            // (prevent show same images on img tag)
            scope: {},
            link: function ($scope, elem, attrs) {
                function revokeObjectURL() {
                    if ($scope.response) {
                        URL.revokeObjectURL($scope.response);
                    }
                }

                $scope.$on('$destroy', function () {
                    revokeObjectURL();
                });

                attrs.$observe('httpSrc', function (url) {
                    revokeObjectURL();
                    if (url && url.indexOf('data:') === 0) {
                        $scope.objectURL = url;
                    } else if (url) {
                        if ("IMG" === elem[0].tagName) {
                            $http.get(url, {
                                responseType: 'arraybuffer',
                                headers: {
                                    'accept': 'image/webp,image/*,*/*;q=0.8'
                                }
                            }).then(function (response) {
                                var blob = new Blob(
                                    [response.data],
                                    {type: response.headers('Content-Type')}
                                );
                                $scope.objectURL = URL.createObjectURL(blob);
                                elem.attr('src', $scope.objectURL);
                            }, function (error) {

                                if (error.status === -1 && url.indexOf("wh-print-app") > 0) {
                                    lincUtil.errorPopup("Connection Time out while get " + url + ", please make sure printer is powered on and not busy!");
                                    return;
                                }
                                // lincUtil.processErrorResponse(error);
                            });
                            if (!elem.attr("ng-click")) {
                                elem.bind('click', function (event) {
                                    lincUtil.popupImage($scope.objectURL);
                                });
                            }

                        } else if ("IFRAME" === elem[0].tagName) {
                            $http.get(url, {
                                responseType: 'arraybuffer'
                            }).then(function (response) {
                                var blob = new Blob(
                                    [response.data],
                                    {type: response.headers('Content-Type')}
                                );
                                $scope.objectURL = URL.createObjectURL(blob);
                                elem.attr('src', $scope.objectURL);
                            }, function(err){
                                var dec = new TextDecoder("utf-8");
                                err.data = JSON.parse(dec.decode(err.data));
                                lincUtil.processErrorResponse(err);
                            });

                        } else if ("A" === elem[0].tagName) {
                            var href =  linc.config.contextPath + url;
                            elem.attr('href', href );

                        } else if ("VIDEO" === elem[0].tagName) {
                            var href = linc.config.contextPath + url;
                            elem.attr('src', href);

                        }
                    }
                });
            }
        }
            ;
    }])
    ;
})
;
