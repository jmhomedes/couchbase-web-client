(function(){

    angular.module('jmh.i18n')
    .filter('translate', translate);

    translate.$inject = ['i18n'];
    function translate(i18n){

        getLiteral.$stateful = true;
        function getLiteral(input, relatives){
            return i18n.get(input, relatives);
        }

        return getLiteral;
    }

})();