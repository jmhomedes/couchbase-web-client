(function(){

    angular.module('jmh.svgLoader', [])
    .directive('jmhSvgLoader', svgLoader);

    function svgLoader(){
        var dirObj = {
            template: '<div ng-hide="!loader.loading" class="loadingDiv"></div>',
            replace: true,
            restrict: 'E',
            scope: {},
            bindToController: {},
            controller: svgLoaderController,
            controllerAs: 'loader'
        };

        svgLoaderController.$inject = ['$scope'];
        function svgLoaderController($scope){

            var vm = this;

            $scope.$on('$stateChangeStart', showLoader);
            $scope.$on('$stateChangeSuccess', hideLoader);
            $scope.$on('$stateChangeError', hideLoader);

            function showLoader(event, toState, toParams, fromState, fromParams){
                vm.loading = true;
            }

            function hideLoader(event, toState, toParams, fromState, fromParams){
                vm.loading = false;
            }
        }

        return dirObj;
    }

})();