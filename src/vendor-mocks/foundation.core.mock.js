(function(){
    angular.module('foundation.core.mock', [])
    .service('FoundationApi', FoundationApi);

    function FoundationApi(){
        var api = {
            publish: publish
        };

        function publish(){

        }

        return api;
    }

})();