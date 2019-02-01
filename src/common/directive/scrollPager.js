'use strict';

define(['angular', './directives'], function(angular, directives) {
    directives.directive('scrollPager', ['$window','$document', function ($window,$document) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/scrollPager.html',
            transclude: true,
            scope: {
                loading: '=loadingFlag',  // data loading flag , used to hide the loading animation. , the loadCount function should take care of this flag;
                totalCount: '=',
                pageSize: '=',
                stay: '@', // stay current page when list length changed.
                loadContent: '&'
            },
            link:  function(scope, element, attrs) {
                angular.element($window).bind("scroll", function(){
                    if( $window.scrollY + $document[0].body.offsetHeight >  $document[0].body.scrollHeight * 0.9){
                        loadMore(scope);
                    }
                });

            },
            controller: function($scope){
                $scope.pager = {};

                initialPager($scope);
                loadDefaultPager($scope);

                $scope.$watch("totalCount" , function(){
                    if ($scope.totalCount === 0 || $scope.lastTotalCount == $scope.totalCount) return ;
                    reInitialPager($scope);
                });

                $scope.$watch("pageSize" , function(){
                    if ($scope.pageSize === 0 || $scope.lastPageSize == $scope.pageSize) return ;
                    reInitialPager($scope);
                });

                $scope.clickToLoadMore = function(){
                      loadMore($scope);
                };
            }
        };

        function loadMore(scope) {
            if(!scope.loading) {
                changeActivePage(scope, scope.pager.activedPage + 1 > scope.pager.totalPage ? scope.pager.totalPage : scope.pager.activedPage + 1);
                scope.$applyAsync(!scope.loading);
            }
        }

        function changeActivePage(scope, page) {
            if (scope.pager.activedPage == page) {
                return;
            }
            scope.pager.activedPage = page;
            scope.loadContent({'currentPage': page, 'pageSize': scope.pageSize, 'totalCount': scope.totalCount});

        }

        function initialPager(scope){
            scope.pager.totalPage = Math.ceil(scope.totalCount / scope.pageSize);
            scope.lastTotalCount = scope.totalCount;
            scope.lastPageSize = scope.pageSize;
        }

        function loadDefaultPager(scope){
            scope.pager.activedPage = 1;
        }

        function reInitialPager(scope) {
            initialPager(scope);
            if (scope.stay) {
                var reActivePage = scope.pager.activedPage;
                scope.pager.activedPage = -1;
                changeActivePage(scope, reActivePage);
            }else {
                loadDefaultPager(scope);
            }
        }

    }]);
});