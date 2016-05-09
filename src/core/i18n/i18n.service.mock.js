(function(){

    angular.module('jmh.i18n.mock', [
        'constants',
        'jmh.errors'
    ])
    .factory('i18n', i18n)
    .filter('translate', translate);

    i18n.$inject = ['$q'];
    function i18n($q) {

        var checkDictionary = function(lang){};

        var get = function (code, relatives) {};

        var i18nApi = {
            get: get,
            checkDictionary: checkDictionary
        };

        return i18nApi;
    }

    translate.$inject = [];
    function translate(){

        function getLiteral(input, relatives){
            return input + JSON.stringify(relatives);
        }

        return getLiteral;
    }

})();