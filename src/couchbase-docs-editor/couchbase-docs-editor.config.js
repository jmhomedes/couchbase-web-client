(function(){
    angular.module('app.couchbase-docs-editor')
    .config(cbDocsEditorConfig);

    cbDocsEditorConfig.$inject = ['$stateProvider', 'stateNames'];
    function cbDocsEditorConfig($stateProvider, stateNames){
        $stateProvider.state(stateNames.CB_EDITOR, {
            url: '/documents-editor',
            views: {
                "main@": {
                    controller: 'CbDocsEditorCtrl as cbDocsEditor',
                    templateUrl: 'couchbase-docs-editor/couchbase-docs-editor.tpl.html'
                }
            },
            data: {
                pageTitle: 'Couchbase docs editor'
            },
            resolve: {}
        });
    }
})();