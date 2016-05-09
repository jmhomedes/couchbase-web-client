(function(){

    angular.module( 'jmh.notify')
    .directive('jmhNotify', notify);

    notify.$inject = ['notifyService', '$timeout'];
    function notify(notifyService, $timeout){

        var dirObj = {
            templateUrl: 'components/notify/notify.tpl.html',
            replace: true,
            restrict: 'E',
            scope: {},
            bindToController: {},
            controller: notifyController,
            controllerAs: 'notify'
        };

        notifyController.$inject = ['$scope'];
        function notifyController($scope){
            var vm = this,
                timeout = notifyService.getTimeout(),
                timeoutPromise = null;

            vm.alerts = notifyService.getAllMessages();

            vm.getTop = function(index){
                return { top: (index*2.8)+'rem' };
            };

            $scope.$watch(function(){
                return vm.alerts.length;
            }, function(newVal, oldVal){
                if(newVal){
                    if(oldVal){
                        $timeout.cancel(timeoutPromise);
                    }
                    timeoutPromise = $timeout(notifyService.removeFirst, timeout);
                }
            });
        }

        return dirObj;
    }

})();