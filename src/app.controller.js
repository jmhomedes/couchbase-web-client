(function() {

    angular.module( 'app')
    .controller( 'MainCtrl', MainController);

    MainController.$inject = ['$scope', '$window', 'stateNames'];
    function MainController($scope, $window, stateNames) {
        var vm = this;

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
            $window.scrollTo(0, 0);

            // Page Title:
            if ( angular.isDefined( toState.data.pageTitle ) ) {
                vm.pageTitle = toState.data.pageTitle;
            }
        });

        vm.stateNames = stateNames;
    }

 })();

