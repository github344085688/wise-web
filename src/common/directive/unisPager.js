'use strict';

define(['./directives',"lodash"], function(directives,_) {
    directives.directive('unisPager', function () {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/unisPager.html',
            replace: true,
            scope: {
                totalCount: '=',
                pageSize: '=',
                stay: '@', // stay current page when list length changed.
                pagerShowCount: '@',    //should be an odd number;
                loadContent: '&',
                currentPage: '=',
                hideTotalRecord: '@'
            },
            link:  function(scope, element, attrs, controller) {
            },
            controller: function($scope){
                $scope.pager = {};
                $scope.inputPage = 1;
                $scope.totalCountFirstInitialed = false;  // used to fix duplicate loadContent execution when the loadContent func was trigger from outside directive.
                setupPageSizeOptions($scope);
                initialPager($scope);
                loadDefaultPager($scope);


                $scope.$watch("totalCount" , function(){
                    if ($scope.totalCount === 0 || $scope.lastTotalCount == $scope.totalCount) return ;
                    reInitialPager($scope,false);
                    if(!$scope.totalCountFirstInitialed) {
                        $scope.totalCountFirstInitialed = true;
                    }
                });

                $scope.$watch("pageSize" , function(){
                    if ($scope.pageSize === 0 || $scope.lastPageSize == $scope.pageSize) return ;
                    reInitialPager($scope,true);
                    $scope.inputPage = $scope.pager.activedPage;
                });

                $scope.$watch("currentPage" , function(currentPage){
                    if(currentPage != $scope.pager.activedPage ) {
                        if ($scope.pager.activedPage == currentPage)
                            return ;
                        $scope.pager.activedPage = currentPage? currentPage : 1;
                        $scope.inputPage = currentPage;
                        $scope.pages = loadPager($scope, $scope.pager.activedPage);
                    }

                });

                $scope.loadPage = function(index){
                    changeActivePage($scope, $scope.pages[index].number);
                };

                $scope.loadFirstPage = function(){
                    changeActivePage($scope,1);
                };

                $scope.loadPrevPage = function(){
                    changeActivePage($scope,$scope.pager.activedPage - 1 > 0 ? $scope.pager.activedPage - 1 : 1);
                };

                $scope.loadNextPage = function(){
                    changeActivePage($scope, $scope.pager.activedPage + 1 > $scope.pager.totalPage ? $scope.pager.totalPage : $scope.pager.activedPage + 1);
                };

                $scope.loadLastPage = function(){
                    changeActivePage($scope, $scope.pager.totalPage);
                };

                $scope.goToPage = function() {
                    changeActivePage($scope, $scope.inputPage > $scope.pager.totalPage ? $scope.pager.totalPage  : $scope.inputPage);
                };
            }
        };

        function changeActivePage(scope, page) {
            if (scope.pager.activedPage == page)
                return ;
            scope.pager.activedPage = page;
            scope.inputPage = page;
            scope.pages = loadPager(scope, scope.pager.activedPage);
            scope.loadContent({'currentPage':page,'pageSize':scope.pageSize, 'totalCount':scope.totalCount});

        }

        function initialPager(scope){
            if(!scope.pagerShowCount) {
                scope.pager.pagerShowCount = 5;
            }  else {
                scope.pager.pagerShowCount = scope.pagerShowCount;
            }
            scope.pager.halfPagerShowCount = Math.floor(scope.pager.pagerShowCount / 2);
            scope.pager.totalPage = Math.ceil(scope.totalCount / scope.pageSize);
            scope.lastTotalCount = scope.totalCount;
            scope.lastPageSize = scope.pageSize;
        }

        function loadDefaultPager(scope){
            scope.pager.activedPage = 1;
            scope.pages = loadPager(scope, scope.pager.activedPage);
        }

        function reInitialPager(scope,isLoadContent) {
            initialPager(scope);
            if (scope.stay) {
                if (scope.pager.activedPage > scope.pager.totalPage) {
                    scope.pager.activedPage = 1;
                }
                var reActivePage = scope.pager.activedPage;
                scope.pager.activedPage = -1;
                changeActivePage(scope, reActivePage);
            }else {
                scope.pager.activedPage = 1;
                scope.pages = loadPager(scope, scope.pager.activedPage);
                if(scope.totalCountFirstInitialed) {
                    if (isLoadContent) {
                      scope.loadContent({
                        'currentPage': scope.pager.activedPage,
                        'pageSize': scope.pageSize,
                        'totalCount': scope.totalCount
                      });
                    }
                }
            }
        }

        function setupPageSizeOptions(scope) {
            var defaultPageSizeOptions = [10, 20 ,50, 100, 300,500,1000];
            defaultPageSizeOptions.push(parseInt(scope.pageSize));
            scope.pageSizeOptions = _.sortBy(_.uniq(defaultPageSizeOptions));
        }

        function loadPager(scope, activedPage) {
            var halfPagerShowCount = scope.pager.halfPagerShowCount;
            var totalPage = scope.pager.totalPage;
            var pagerShowCount = scope.pager.pagerShowCount;

            var pages =[];
            var low = (activedPage- halfPagerShowCount <= 1) ? 1: activedPage + halfPagerShowCount <= totalPage ?  activedPage - halfPagerShowCount: totalPage - (pagerShowCount -1) <= 1 ? 1: totalPage - (pagerShowCount -1);
            var high = low + (pagerShowCount -1) <= totalPage ? low + (pagerShowCount -1) : totalPage;
            for (var i = low ; i <= high; i++ ){
                if (i === activedPage){
                    pages.push({"number":i,"active":true});
                }else {
                    pages.push({"number":i,"active":false});
                }
            }
            scope.pager.low = low;
            scope.pager.high = high;
            return pages;
        }

    });
});