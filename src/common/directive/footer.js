'use strict';

define([
	'angular',
	'./directives'
], function(angular, directives) {
	directives.directive('footer', ['$window', '$document', function ($window, $document) {
		return {
			templateUrl: 'common/directive/template/footer.html',
            link: function(scope, element, attrs, controller) {
	            var offset = 300;
	            var duration = 500;

	            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {  // ios supported
	                angular.element($window).bind("touchend touchcancel touchleave", function(e){
	                   if (angular.element(this).scrollTop() > offset) {
	                        element.find('.scroll-to-top').fadeIn(duration);
	                    } else {
	                        element.find('.scroll-to-top').fadeOut(duration);
	                    }
	                });
	            } else {  // general 
	                angular.element($window).scroll(function() {
	                    if (angular.element(this).scrollTop() > offset) {
	                        element.find('.scroll-to-top').fadeIn(duration);
	                    } else {
	                        element.find('.scroll-to-top').fadeOut(duration);
	                    }
	                });
	            }
	            
	            element.find('.scroll-to-top').click(function(e) {
	                e.preventDefault();
	                $document.find('html, body').animate({scrollTop: 0}, duration);
	                return false;
	            });
            }
		};
	}]);
});