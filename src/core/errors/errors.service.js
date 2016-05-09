(function(){

    angular.module( 'jmh.errors', [
        'jmh.notify'
    ])
    .factory('errors', errors);

    errors.$inject = ['notifyService'];
    function errors(notifyService){

        function throwError(message){
            return function(reason){
                var errorMsg;

                if(typeof(reason) === 'object') {
                    reason = JSON.stringify(reason);
                    notifyService.addMessage(message+': '+reason);
                }
            };
        }

        var api = {
            throwError: throwError
        };

        return api;
    }

})();