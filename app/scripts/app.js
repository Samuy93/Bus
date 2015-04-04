'use strict';

/**
 * @ngdoc overview
 * @name busUiApp
 * @description
 * # busUiApp
 *
 * Main module of the application.
 */
angular
  .module('busUiApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngMaterial',
    'ngMdIcons'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/searchAddress', {
        templateUrl: 'views/SearchByStreet.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
