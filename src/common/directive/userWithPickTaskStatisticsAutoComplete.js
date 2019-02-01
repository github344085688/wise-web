'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('userWithPickTaskStatisticsAutoComplete', ['$q', 'userService', 'session', function ($q, userService, session) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/userWithPickTaskStatisticsAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                ifDisabled: '=',
                required: '@',
                onSelect: '&',
                allowClear: '@',
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
                $scope.users = [];

                $scope.getUsers = function (keyword) {
                    if ($scope.removeDisableAndLockedUser==="false") {
                        var param = { keyword: keyword, scenario: 'Auto Complete' };   
                    }else{
                        var param = { keyword: keyword, scenario: 'Auto Complete', status:"Active"};
                    }
                    var currentCf = session.getCompanyFacility();
                    if (currentCf) {
                        param.facilityId = currentCf.facilityId;
                    }
                    if (init) {
                        userService.searchUserWithPickTaskStatistics(param).then(function (response) {
                            $scope.users = _.unionBy($scope.users, response, "idmUserId");
                        });
                        init = false;
                    } else {
                        userService.searchUserWithPickTaskStatistics(param).then(function (response) {
                            $scope.users = response;
                        });
                    }
                };
            }
        };
    }]);
});
