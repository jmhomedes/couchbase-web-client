(function(){

    var stateNames =  {
        CB_EDITOR: 'app.couchbase-docs-editor'
    };

    angular.module('constants', [])
    .constant('stateNames', stateNames);

})();