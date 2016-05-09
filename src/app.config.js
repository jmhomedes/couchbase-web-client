(function() {

    angular.module( 'app')
    .config(appConfig);

    appConfig.$inject = ['$urlRouterProvider','$locationProvider', '$httpProvider', '$stateProvider', 'stateNames'];
    function appConfig($urlRouterProvider, $locationProvider, $httpProvider, $stateProvider, stateNames) {

        $locationProvider.html5Mode(true).hashPrefix('!');

        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get("$state");
            $state.go(stateNames.CB_EDITOR);
        });

        ///////////////////////////
        //SETTING ABSTRACT STATE //
        ///////////////////////////
        $stateProvider.state('app', {
            abstract: true,
            views: {}
        });

        ///////////////////////////
        // HEADERS CUSTOMIZATION //
        ///////////////////////////
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Sat, 29 Oct 1994 19:43:31 GMT';
    }
 })();