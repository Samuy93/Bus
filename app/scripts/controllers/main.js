'use strict';

/**
 * @ngdoc function
 * @name busUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the busUiApp
 */
angular.module('busUiApp')
	.controller('MainCtrl', function($scope) {
		$scope.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];
	})
	.controller('AppCtrl', function($scope, $timeout, $mdSidenav, $log, $location) {
		$scope.icon = "view_headline";
		$scope.toggleLeft = function($event) {
			$scope.icon = $scope.icon === 'arrow_back'?'view_headline':'arrow_back';
			$mdSidenav('left').toggle()
				.then(function() {
					$log.debug("toggle left is done");
				});
		};
		$scope.toggleRight = function() {
			$mdSidenav('right').toggle()
				.then(function() {
					$log.debug("toggle RIGHT is done");
				});
		};
		$scope.goTo =function(target){
			$location.path('/' + target);
			$scope.toggleLeft();
		}
	})
	.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $log) {
		$scope.close = function() {
			$mdSidenav('left').close()
				.then(function() {
					$log.debug("close LEFT is done");
				});
		};
	})
	.controller('RightCtrl', function($scope, $timeout, $mdSidenav, $log) {
		$scope.close = function() {
			$mdSidenav('right').close()
				.then(function() {
					$log.debug("close RIGHT is done");
				});
		};
	});