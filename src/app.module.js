(function() {

    angular.module( 'app', [
        // Layout Modules
        'templates-app',
        'templates-foundationApps',
        'templates-angularFoundation',
        // Angular Modules
        'ngResource',
        'ngSanitize',
        'ngCookies',
        'ngAnimate',
        // 3rd party Modules
        'foundation',
        'ui.router',
        // Component Modules
        'jmh.deviceDetect',
        'jmh.svgLoader',
        'jmh.notify',
        // Core Modules
        'constants',
        'jmh.i18n',
        'jmh.errors',
        // Feature Modules
        'app.couchbase-docs-editor'
    ]);

 })();

