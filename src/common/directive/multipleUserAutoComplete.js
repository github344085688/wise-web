'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('multipleUserAutoComplete', ['$q', 'userService', 'session', function ($q, userService, session) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleUserAutoComplete.html',
            scope: {
                ngModel: '=',
                name: '@',
                ifDisabled: '=',
                required: '@',
                onSelect: '&',
                onRemove: '&',
                limit: '@',
                removeDisableAndLockedUser: '@'
            },
            link: function ($scope) {
                $scope._onSelect = function (user) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ user: user });
                    }
                };
                $scope._onRemove = function (user) {
                    if ($scope.onRemove) {
                        $scope.onRemove({ user: user });
                    }
                };
                var init = true;
                $scope.users = [];

                function userSort() {
                    _.forEach($scope.users, function (user) {
                        user.notifyUserName = $scope.getUserName(user).toLowerCase();
                    });
                    $scope.users = _.orderBy($scope.users,['isAndroidOnline','notifyUserName'], ['desc', 'asc']);
                }

                $scope.getUsers = function (keyword) {
                    if (!$scope.limit) {
                        $scope.limit = 0;
                    }
                    if ($scope.removeDisableAndLockedUser === "false") {
                        var param = { keyword: keyword, scenario: 'Auto Complete', limit: $scope.limit };
                    } else {
                        var param = { keyword: keyword, scenario: 'Auto Complete', status: "Active", limit: $scope.limit };
                    }

                    setFacilityParam(param);
                    searchUsers(param, $scope.ngModel);
                };

                function searchUsers(param, ngModel) {
                    if (!ngModel || ngModel.length <= 0) {
                        userService.searchUsers(param).then(function (response) {
                            $scope.users = response;
                            userSort();
                        });
                    } else {
                        if (init) {
                            userService.searchUsers({ idmUserIds: ngModel }).then(function (response) {
                                userService.searchUsers(param).then(function (data) {
                                    $scope.users = _.unionBy(data, response, "idmUserId");
                                    userSort();
                                });
                            });
                        } else {
                            userService.searchUsers(param).then(function(data){
                                $scope.users = _.unionBy($scope.users, data, 'idmUserId');
                                userSort();
                            });
                        }
                        if (init) {
                            init = false;
                        }
                    }
                    
                }

                function setFacilityParam(param) {
                    var currentCf = session.getCompanyFacility();
                    if (currentCf) {
                        param.facilityId = currentCf.facilityId;
                    }
                }

                $scope.getUserName = function (user) {
                    if (!user) return "";
                    if (user.firstName && user.lastName) {
                        return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
                    }
                    return user.username;
                };


                $scope.$watch("ngModel", function (val) {
                    if (!$scope.limit) {
                        $scope.limit = 0;
                    }
                    if ($scope.removeDisableAndLockedUser === "false") {
                        var param = { scenario: 'Auto Complete', limit: $scope.limit };
                    } else {
                        var param = { scenario: 'Auto Complete', status: "Active" , limit: $scope.limit};
                    }
                    setFacilityParam(param);
                    searchUsers(param, val);
                });
            }
        };
    }]);
});
