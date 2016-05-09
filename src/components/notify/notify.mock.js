(function(){
    angular.module('jmh.notify.mock', [])
    .factory('notifyService', notifyService);

    function notifyService() {
        var api = {
            addMessage: addMessage
        };

        function addMessage(msg){
            // NOOP
        }

        return api;
    }

})();