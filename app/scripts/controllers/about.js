'use strict';

/**
 * @ngdoc function
 * @name busUiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the busUiApp
 */
angular.module('busUiApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
