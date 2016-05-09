(function(){

    angular.module('jmh.i18n', [
        'constants',
        'jmh.errors'
    ])
    .factory('i18n', i18n)
    .run(startWatchingLanguageChange);

    i18n.$inject = ['$http', '$q'];
    function i18n($http, $q) {

        var _unknown = [],
            _currentLang = '',
            _dictionaries = {};

        var checkDictionary = function(lang){
            var deferred = $q.defer();
            lang = lang || 'en_US';

            if (_dictionaries[lang]) {
                console.log('Language Previously Loaded: ', lang);
                _currentLang = lang;
                deferred.resolve(true);
            } else {
                $http.get('/couchbase-client/assets/data/dictionary-' + lang + '.json').then(
                    function success(response) {
                        console.log('Language Load: ', response.data);
                        _dictionaries[lang] = response.data;
                        _currentLang = lang;
                        deferred.resolve(response);
                    },
                    deferred.reject
                );
            }
            return deferred.promise;
        };

        checkDictionary();

        var get = function (code, relatives) {
            if (_dictionaries[_currentLang]) {
                var out = _dictionaries[_currentLang].hasOwnProperty(code) ? _dictionaries[_currentLang][code] : null;
                if (out !== null) {
                    if (typeof relatives === 'object') {
                        for (var prop in relatives) {
                            out = out.replace(new RegExp('\\{' + prop + '\\}'), relatives[prop]);
                        }
                    }
                    return out;
                }
                else {
                    var i, notFound;
                    for(i = 0, notFound = true; i < _unknown.length && notFound; i++){
                        if(_unknown[i] === code) notFound = false;
                    }

                    if(notFound){
                        _unknown.push(code);
                        console.log('UNKNOWN i18n CODE: ' + code);
                    }
                }
            }
            return '[' + code + ']';
        };

        var i18nApi = {
            get: get,
            checkDictionary: checkDictionary
        };

        return i18nApi;
    }

    startWatchingLanguageChange.$inject = ['$rootScope', 'i18n', 'errors'];
    function startWatchingLanguageChange($rootScope, i18n, errors){
        $rootScope.$on('$stateChangeSuccess', checkLanguageChange);

        function checkLanguageChange(event, toState, toParams, fromState, fromParams){
            //i18n
            if(fromParams.lang !== toParams.lang && toParams.lang){
                i18n.checkDictionary(toParams.lang)
                .catch(errors.throwError('Language not found'));
            }
        }
    }

})();