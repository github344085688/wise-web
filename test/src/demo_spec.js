
define(['angular',
    'angularMocks',
    'angularResource',
    'src/common/factory/loader',
    'angularUIRouter',
    'src/admin/main',
    'angularMaterial',
    'src/common/directive/loader',
    'src/common/directive/template/pager.html'], function(){
    describe('Test Demo', function() {
        var userService, $compile;
        beforeEach(module('ngResource'));
        beforeEach(module('linc.factories'));
        beforeEach(module('linc.directives'));
        beforeEach(module('ui.router'));
        beforeEach(module('ngMaterial'));
        beforeEach(module('linc.admin.main'));
        beforeEach(module('common/directive/template/pager.html'));
        beforeEach(inject(function(_userService_, _$compile_) {
            userService = _userService_;
            $compile = _$compile_;
        }));

        it('User service auto complete query must exist', function() {
            expect(userService.autoCompleteQuery).toBeDefined();
        });

        it('User service search function must exist', function() {
            expect(userService.searchUsers).toBeDefined();
        });


        //Test Service
        it('User service backend work fine as designed', inject(function($rootScope,$httpBackend){

            $httpBackend.whenPOST('/idm-app/user/search').respond(200, [{idmUserId:1,username:"easonc"}]);
            userService.searchUsers({}).then(function (data) {
                expect(data[0].username).toBe("easonc");
            }, function(err){
                expect(err).toBeDefined();
            });
            $httpBackend.flush();
        }));


        //Test Controller
        it('Add tag function in the controller works fine as designed', inject(function($controller,$httpBackend){
            var $scope = {};
            $httpBackend.whenGET('/idm-app/tag/all').respond(200, []);
            $httpBackend.whenPOST('/idm-app/tag').respond(200, {});
            var ctrl = $controller('TagManagementPageController', {$scope: $scope});
            $scope.name = "Test";
            $scope.addTag();
            $httpBackend.flush();
            expect($scope.tags.length).toEqual(1);
        }));


        //Test Directive
        it('Test pager directive', inject(function($controller,$httpBackend, $rootScope){

            $rootScope.loadContent = function(currentPage){};
            var element = $compile('<pager total-count="8" page-size="2" load-content="loadContent(currentPage)"></pager>')($rootScope);
            $rootScope.$apply();
            expect(element.html()).toContain('Showing 1 to 2 of 8 records');
        }));

    });
});