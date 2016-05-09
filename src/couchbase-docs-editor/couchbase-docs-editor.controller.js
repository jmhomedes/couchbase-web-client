(function(){
    angular.module('app.couchbase-docs-editor')
    .controller('CbDocsEditorCtrl', CbDocsEditorController);

    CbDocsEditorController.$inject = ['$q', '$filter', '$timeout', 'notifyService', 'couchbaseApi', 'FoundationApi'];
    function CbDocsEditorController($q, $filter, $timeout, notifyService, couchbaseApi, FoundationApi){
        var vm = this;

        // Properties:
        vm.bucketList = [];
        vm.activeTab = 0; // tabs
        vm.numDocsArray = [10, 50, 100, 200, 300, 500];
        vm.documentsPerPage = 300; //pagination
        vm.docsTabs = [];
        vm.docsTabs.push({
            bucket: null,
            documentListNames: [],
            documentName: null,
            documentContent: null,
            docNameFilter: '',
            pageNumber: 1, //pagination
            editorOptions: {
                useWrapMode : false,
                showGutter: true,
                theme:'xcode',
                mode: 'json',
                firstLineNumber: 1,
                onLoad: function (_editor) {
                    // This is to remove following warning message on console:
                    // Automatically scrolling cursor into view after selection change this will be disabled in the next version
                    // set editor.$blockScrolling = Infinity to disable this message
                    _editor.$blockScrolling = Infinity;
                }
            }
        });
        vm.errorExistingDocument = false;

        // Methods:
        vm.addTab = addTab;
        vm.closeTab = closeTab;
        vm.changeTab = changeTab;
        vm.getBuckets = getBuckets;
        vm.getDocuments = getDocuments;
        vm.getDocument = getDocument;
        vm.saveDocument = saveDocument;
        vm.createDocument = createDocument;
        vm.deleteDocument = deleteDocument;
        vm.saveAndChangeDoc = saveAndChangeDoc;
        vm.changeDocWithoutSaving = changeDocWithoutSaving;
        vm.searchDocuments = searchDocuments;
        vm.cleanSearchDocuments = cleanSearchDocuments;

        vm.getBuckets();

        function getBuckets(){
            vm.bucketList = [];
            couchbaseApi.retrieveBuckets(extractBucketsProperties, error);

            function extractBucketsProperties(list){
                list.forEach(extractBucketProperties);

                function extractBucketProperties(currentValue, index, array){
                    if(currentValue.bucketType !== 'memcached' && currentValue.name){
                        vm.bucketList.push({
                            name: currentValue.name,
                            itemCount: currentValue.basicStats.itemCount
                        });
                    }
                }
            }

            function error(){
                notifyService.addMessage({type: 'alert', msg: 'Exception: ERROR'});
            }
        }

        function addTab(){
            if(vm.docsTabs.length < 5){
                vm.docsTabs.push({
                    bucket: null,
                    documentListNames: [],
                    documentName: null,
                    documentContent: null,
                    docNameFilter: '',
                    pageNumber: 1 //pagination
                });

                changeTab(vm.docsTabs.length - 1);
            }
            else{
                notifyService.addMessage({
                    type: 'warning',
                    msg: $filter('translate')('manyTabsWarning')
                });
            }
        }

        function closeTab(tabNumber){
            vm.docsTabs.splice(tabNumber, 1);
            changeTab(!vm.docsTabs[vm.activeTab] ? Math.max(--vm.activeTab, 0) : vm.activeTab);
        }

        function changeTab(tabNumber){
            vm.activeTab = tabNumber;
            if(vm.docsTabs[tabNumber] && vm.docsTabs[tabNumber].editorInstance){
                $timeout(function() {
                    vm.docsTabs[tabNumber].editorInstance.resize();
                }, 200);
            }
        }

        function getDocuments(bucket, pageNumber, activeTab, filter){
            var startKey,
                endKey,
                skipDocs,
                limit;

            vm.docsTabs[activeTab] = {
                bucket: bucket,
                documentListNames: [],
                documentName: null,
                documentRev: null,
                documentContent: null,
                documentContentOrig: null,
                docNameSearch: filter,
                searchActive: vm.docsTabs[activeTab].searchActive,
                docNameFilter: '',
                pageNumber: pageNumber, //pagination
                editorOptions: {
                    useWrapMode : false,
                    showGutter: true,
                    theme:'xcode',
                    mode: 'json',
                    firstLineNumber: 1,
                    onLoad: function (_editor) {
                        // This is to remove following warning message on console:
                        // Automatically scrolling cursor into view after selection change this will be disabled in the next version
                        // set editor.$blockScrolling = Infinity to disable this message
                        _editor.$blockScrolling = Infinity;
                        vm.docsTabs[activeTab].editorInstance = _editor;
                    }
                }
            };

            if(bucket){
                if(typeof(filter) !== 'undefined' && vm.docsTabs[activeTab].searchActive){
                    if(typeof(filter) !== 'string' || !filter || filter.indexOf('*') !== filter.length-1){
                        notifyService.addMessage({
                            type: 'alert',
                            msg: $filter('translate')('filterFormatAdvice')
                        });
                    }
                    else{
                        startKey = filter.split('*')[0] + '!';
                        endKey = filter.split('*')[0] + '}';
                        proceedToGet();
                    }
                }
                else{
                    proceedToGet();
                }
            }

            function proceedToGet(){
                vm.docsTabs[activeTab].documentListNames.pending = true;

                skipDocs = vm.documentsPerPage*(pageNumber-1);
                limit = vm.documentsPerPage;

                getDocumentsByPage(skipDocs, limit, startKey, endKey);
            }

            function getDocumentsByPage(skipDocs, limitDocs, startKey, endKey){
                couchbaseApi.retrieveDocuments(bucket.name, skipDocs, limitDocs, startKey, endKey, extractDocumentNames, error);
            }

            function extractDocumentNames(documentsObject){
                vm.docsTabs[activeTab].documentListNames.pending = false;
                documentsObject.rows.forEach(extractDocumentName);

                function extractDocumentName(currentValue, index, array){
                    if(currentValue.key){
                        vm.docsTabs[activeTab].documentListNames.push(currentValue.key);
                    }
                }
            }

            function error(){
                vm.docsTabs[activeTab].documentListNames.pending = false;
                notifyService.addMessage({type: 'alert', msg: 'Exception: ERROR'});
            }
        }

        function getDocument(bucketName, documentKey, activeTab){
            var origDoc = vm.docsTabs[activeTab].documentContentOrig,
                doc = vm.docsTabs[activeTab].documentContent,
                deferred = $q.defer();

            if(origDoc && origDoc !== doc){
                vm.documentKeyToChange = documentKey;
                FoundationApi.publish('docNotSavedModal', 'open');
                deferred.reject();
            }
            else{
                vm.docsTabs[activeTab].documentContentOrig = null;
                vm.docsTabs[activeTab].documentContent = null;
                vm.docsTabs[activeTab].documentName = documentKey;
                couchbaseApi.retrieveDocument(bucketName, documentKey, extractDocumentContent, fail);
            }

            function extractDocumentContent(documentObject){
                if(documentObject && documentObject.json){
                    vm.docsTabs[activeTab].documentRev = documentObject.meta.rev;
                    vm.docsTabs[activeTab].documentContentOrig = JSON.stringify(documentObject.json, null, 4);
                    vm.docsTabs[activeTab].documentContent = JSON.stringify(documentObject.json, null, 4);
                    deferred.resolve();
                }
                else{
                    fail();
                }
            }

            function fail(error){
                if(error && error.status === 404){
                    notifyService.addMessage({type: 'alert', msg: $filter('translate')('docNotFoundOnThisBucket')});
                }
                else{
                    notifyService.addMessage({type: 'alert', msg: 'Exception: ERROR'});
                }
                deferred.reject();
            }

            return deferred.promise;
        }
        //
        function saveDocument(bucketName, documentName, rev, documentContent, activeTab){
            var newRev, annotations, errorsMsg , deferred = $q.defer();

            if(vm.docsTabs[activeTab].editorInstance && vm.docsTabs[activeTab].editorInstance.session.$annotations.length){
                annotations = vm.docsTabs[activeTab].editorInstance.session.$annotations;
                errorsMsg = '';

                annotations.forEach(function(current, intex, array){
                    errorsMsg += $filter('translate')('atRowColumnText', {
                        0: current.type,
                        1: current.row,
                        2: current.column,
                        3: current.text
                    });
                    if(intex < array.length-1){
                        errorsMsg += '<br/>';
                    }
                });

                notifyService.addMessage({type: 'alert', msg: errorsMsg});

                deferred.reject();
            }
            else{
                couchbaseApi.retrieveDocument(bucketName, documentName, checkConsistency, error);
            }

            function checkConsistency(response){
                if(response.meta && response.meta.rev === rev){
                    couchbaseApi.updateDocument(bucketName, documentName, JSON.parse(documentContent), successfulSave, failureSave);
                }
                else{
                    notifyService.addMessage({type: 'alert', msg: $filter('translate')('exceptionDocumentChanged')});
                    deferred.reject();
                }
            }

            function error(){
                notifyService.addMessage({
                    type: 'alert',
                    msg: $filter('translate')('exceptionRetrievingDocument', {
                        0: documentName
                    })
                });
                deferred.reject();
            }

            function successfulSave(response){
                vm.docsTabs[activeTab].documentContentOrig = documentContent;
                notifyService.addMessage({type: 'success', msg: 'Document saved successfully'});
                vm.docsTabs[activeTab].documentName = null;
                vm.docsTabs[activeTab].documentRev = null;
                vm.docsTabs[activeTab].documentContentOrig = null;
                vm.docsTabs[activeTab].documentContent = null;

                deferred.resolve(response);
            }

            function failureSave(error){
                notifyService.addMessage({type: 'alert', msg: 'Exception: ' + error});
                deferred.reject();
            }

            return deferred.promise;
        }


        function createDocument(bucket, pageNumber, documentName, activeTab, documentContent, searchFilter){
            vm.errorExistingDocument = false;
            if(typeof(documentContent) === 'undefined'){
                documentContent = {
                  'click': 'to edit',
                  'new in 2.0': 'there are no reserved field names'
                };
            }
            else{
                documentContent = JSON.parse(documentContent);
            }
            couchbaseApi.createDocument(bucket.name, documentName, documentContent, successfulCopy, failureCopy);

            function successfulCopy(){
                FoundationApi.publish('saveAsModal', 'close');
                FoundationApi.publish('newDocModal', 'close');
                getDocuments(bucket, pageNumber, activeTab, searchFilter);
                getDocument(bucket.name, documentName, activeTab);
                notifyService.addMessage({type: 'success', msg: 'Document created successfully'});
            }

            function failureCopy(isDuplicated){
                if(isDuplicated){
                    vm.errorExistingDocument = true;
                }
                else{
                    FoundationApi.publish('saveAsModal', 'close');
                    FoundationApi.publish('newDocModal', 'close');
                    notifyService.addMessage({type: 'alert', msg: 'Exception: Unexpected error'});
                }
            }
        }

        function deleteDocument(bucket, pageNumber, documentName, activeTab, searchFilter){
            couchbaseApi.deleteDocument(bucket.name, documentName, successfulRemove, failureRemove);

            function successfulRemove(){
                FoundationApi.publish('deleteDocModal', 'close');
                getDocuments(bucket, pageNumber, activeTab, searchFilter);
                notifyService.addMessage({type: 'success', msg: 'Document deleted successfully'});
            }

            function failureRemove(){
                FoundationApi.publish('deleteDocModal', 'close');
                getDocuments(bucket, pageNumber, activeTab, searchFilter);
                notifyService.addMessage({type: 'alert', msg: 'Error deleting document'});
            }
        }

        function saveAndChangeDoc(bucket, documentName, rev, documentContent, activeTab, docToChange){
            var promise = saveDocument(bucket.name, documentName, rev, documentContent, activeTab).then(changeDocument);

            function changeDocument(){
                FoundationApi.publish('docNotSavedModal', 'close');
                getDocument(bucket.name, docToChange, activeTab);
            }
        }

        function changeDocWithoutSaving(bucket, activeTab, docToChange){
            vm.docsTabs[activeTab].documentContentOrig = vm.docsTabs[activeTab].documentContent;
            getDocument(bucket.name, docToChange, activeTab);
        }

        function searchDocuments(bucket, documentKey, activeTab){
            if(documentKey){
                if(documentKey.indexOf('*') >= 0){
                    vm.docsTabs[activeTab].searchActive = true;
                    getDocuments(bucket, 1, activeTab, documentKey);
                }
                else{
                    getDocument(bucket.name, documentKey, activeTab);
                }
            }
        }

        function cleanSearchDocuments(bucket, activePage, activeTab){
            vm.docsTabs[activeTab].searchActive = false;
            getDocuments(bucket, activePage, activeTab);
        }
    }
})();