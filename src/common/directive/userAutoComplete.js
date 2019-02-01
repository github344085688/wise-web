'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('userAutoComplete', ['$q', 'userService', 'session', function ($q, userService, session) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/userAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                ifDisabled: '=',
                required: '@',
                onSelect: '&',
                allowClear: '@',
                limit: '@',
                removeDisableAndLockedUser: '@'
            },
            link: function ($scope) {
                if (!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function (user) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ user: user });
                    }
                };

                var init = true;
                var watchModelInitialed = false;
                $scope.users = [];

                function userSort() {
                    _.forEach($scope.users, function (user) {
                        user.notifyUserName = $scope.getUserName(user).toLowerCase();
                    });
                    $scope.users = _.sortBy($scope.users, ['notifyUserName']);
                }

                $scope.getUsers = function (keyword) {
                    if (!$scope.limit) {
                        $scope.limit = 0;
                    }
                    if ($scope.removeDisableAndLockedUser==="false") {
                        var param = { keyword: keyword, scenario: 'Auto Complete', limit: $scope.limit  };   
                    }else{
                        var param = { keyword: keyword, scenario: 'Auto Complete',status:"Active", limit: $scope.limit};
                    }
                    var currentCf = session.getCompanyFacility();
                    if (currentCf) {
                        param.facilityId = currentCf.facilityId;
                    }
                    if (init) {
                        userService.searchUsers(param).then(function (response) {
                            $scope.users = _.unionBy($scope.users, response, "idmUserId");
                            userSort();
                        });
                        init = false;
                    } else {
                        userService.searchUsers(param).then(function (response) {
                            $scope.users = response;
                            userSort();
                        });
                    }
                };

                $scope.getUserName = function (user) {
                    if (!user) return "";
                    if (user.firstName && user.lastName) {
                        return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
                    }
                    return user.username;
                };

                $scope.$watch("ngModel", function (val) {

                    if (!watchModelInitialed && val) {
                        userService.getUserById(val).then(function (data) {
                            if (_.findIndex($scope.users, { idmUserId: data.idmUserId }) === -1) {
                                $scope.users.push(data);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);
});
