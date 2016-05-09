(function(){
    angular.module('jmh.notify')
    .config(notifyConfig);

    notifyConfig.$inject = ['$provide'];
    function notifyConfig($provide){
        /////////////////////////////
        // CUSTOM EXEPTION HANDLER //
        /////////////////////////////
        $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function($delegate, $injector){
            return function(exception, cause){
                var notifyService = $injector.get("notifyService");
                if(window.location.hostname === 'localhost'){
                    notifyService.addMessage({type: 'alert', msg: 'Exception: ' + exception});
                }
                $delegate(exception, cause);
            };
        }]);
    }
})();