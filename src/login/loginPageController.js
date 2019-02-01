'use strict';

define(['jquery'], function($) {
	var loginPageController = function($scope, $state, authFactory) {

		$scope.signIn = function() {
			authFactory.signIn($scope.userName, $scope.password , function() {
				$state.go('home');
			});
		};

		function init() {
			$("#androidMark").hover(function () {
                $("#androidMark").fadeOut();
                $("#androidLink").css({
					"margin-right": "-160px"
				}).fadeIn();
                $("#androidLink").animate({
                    "margin-right": "0px"
				}, 1000);
            });

            $("#androidLink").mouseleave(function () {
                $("#androidLink").animate({
                    "margin-right": "-160px"
                }, 1000, function () {
                    $("#androidLink").hide();
                    $("#androidMark").fadeIn();
                });
            })
        }
        init();

	};

	loginPageController.$inject = ['$scope', '$state', 'authFactory'];

	return loginPageController;
});