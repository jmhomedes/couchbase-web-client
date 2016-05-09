describe('Couchbase docs editor Controller', function() {

    var cbDocsEditorController;

    beforeEach(function() {
        module('foundation.core');
        angular.module('mm.foundation.pagination', []);
        angular.module('ui.ace', []);
        module('jmh.notify');
        module('jmh.couchbase-api');
        module('jmh.i18n');

        module('foundation.core.mock');
        module('jmh.notify.mock');
        module('jmh.couchbase-api.mock');
        module('jmh.i18n.mock');

        module('app.couchbase-docs-editor');
    });

    beforeEach(inject(function($controller, $q, $filter, $timeout, notifyService, couchbaseApi, FoundationApi){
        spyOn(couchbaseApi, 'retrieveBuckets').and.callThrough();
        spyOn(couchbaseApi, 'retrieveDocuments').and.callThrough();
        spyOn(couchbaseApi, 'retrieveDocument').and.callThrough();
        spyOn(couchbaseApi, 'updateDocument').and.callThrough();
        spyOn(couchbaseApi, 'createDocument').and.callThrough();
        spyOn(couchbaseApi, 'deleteDocument').and.callThrough();
        spyOn(notifyService, 'addMessage').and.callThrough();
        spyOn(FoundationApi, 'publish').and.callThrough();

        cbDocsEditorController = $controller('CbDocsEditorCtrl', {
            $q : $q,
            $filter: $filter,
            $timeout: $timeout,
            notifyService: notifyService,
            couchbaseApi: couchbaseApi,
            FoundationApi: FoundationApi
        });
    }));

    it('should load properly the bucket list when initializing state',
    inject(function(couchbaseApi, notifyService) {
        expect(couchbaseApi.retrieveBuckets).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
        expect(cbDocsEditorController.bucketList).toEqual([
            { name: 'company', itemCount: 10398 },
            { name: 'company-infraestructure', itemCount: 1 },
            { name: 'company-oauth2', itemCount: 15 },
            { name: 'company-payment-config', itemCount: 80 },
            { name: 'company-payment-order', itemCount: 48 },
            { name: 'company-portal', itemCount: 47 }
        ]);
    }));

    it('should notify an alert when trying to load bucket list and it fails',
    inject(function(couchbaseApi, notifyService) {
        couchbaseApi.mock.setRejectRetrieveBuckets(true);
        cbDocsEditorController.getBuckets();

        expect(couchbaseApi.retrieveBuckets).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
        expect(cbDocsEditorController.bucketList).toEqual([]);
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
    }));

    it('should add an editor tab and switch to it when there are less than 5 open tabs',
    inject(function(couchbaseApi, notifyService) {
        cbDocsEditorController.addTab();

        expect(cbDocsEditorController.docsTabs.length).toBe(2);
        expect(cbDocsEditorController.docsTabs[1]).toEqual({
            bucket: null,
            documentListNames: [],
            documentName: null,
            documentContent: null,
            docNameFilter: '',
            pageNumber: 1 //pagination
        });
        expect(cbDocsEditorController.activeTab).toBe(1);
    }));

    it('should notify a warning when trying to add more than 5 tabs at a time',
    inject(function(couchbaseApi, notifyService) {
        cbDocsEditorController.addTab();
        cbDocsEditorController.addTab();
        cbDocsEditorController.addTab();
        cbDocsEditorController.addTab();
        cbDocsEditorController.addTab();

        expect(cbDocsEditorController.docsTabs.length).toBe(5);
        expect(cbDocsEditorController.activeTab).toBe(4);
        expect(notifyService.addMessage).toHaveBeenCalledWith({
            type: 'warning',
            msg: jasmine.any(String)
        });
    }));

    it('should close an editor tab and switch to its previous when the tab closed is the last tab and you were in it',
    inject(function(couchbaseApi, notifyService) {
        cbDocsEditorController.addTab(); // 2 tabs
        cbDocsEditorController.addTab(); // 3 tabs

        expect(cbDocsEditorController.docsTabs.length).toBe(3);
        expect(cbDocsEditorController.activeTab).toBe(2);

        cbDocsEditorController.closeTab(2);

        expect(cbDocsEditorController.docsTabs.length).toBe(2);
        expect(cbDocsEditorController.activeTab).toBe(1);
    }));

    it('should close an editor tab and keep in current tab when closed one is another tab',
    inject(function(couchbaseApi, notifyService) {
        cbDocsEditorController.addTab(); // 2 tabs
        cbDocsEditorController.addTab(); // 3 tabs

        expect(cbDocsEditorController.docsTabs.length).toBe(3);
        expect(cbDocsEditorController.activeTab).toBe(2);

        cbDocsEditorController.changeTab(0);
        expect(cbDocsEditorController.activeTab).toBe(0);

        cbDocsEditorController.closeTab(2);

        expect(cbDocsEditorController.docsTabs.length).toBe(2);
        expect(cbDocsEditorController.activeTab).toBe(0);
    }));

    it('should load documents list properly for a given bucket, page and tab, with and without key filter',
    inject(function(couchbaseApi, notifyService) {
        var bucketName = 'company',
            pageNumber = 1,
            activeTab = 0,
            filter = 'someKey_*';

        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab);

        expect(couchbaseApi.retrieveDocuments).toHaveBeenCalledWith(bucketName, 0, 300, undefined, undefined, jasmine.any(Function), jasmine.any(Function));

        cbDocsEditorController.docsTabs[0].searchActive = true;
        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab, filter);

        expect(couchbaseApi.retrieveDocuments).toHaveBeenCalledWith(bucketName, 0, 300, 'someKey_!', 'someKey_}', jasmine.any(Function), jasmine.any(Function));
    }));

    it('should empty documents list when no bucket supplied requesting document list',
    inject(function(couchbaseApi, notifyService) {
        var pageNumber = 1,
            activeTab = 0;

        cbDocsEditorController.getDocuments(null, pageNumber, activeTab);

        expect(cbDocsEditorController.docsTabs[0].documentListNames).toEqual([]);
        expect(cbDocsEditorController.docsTabs[0].documentName).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentRev).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentContent).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentContentOrig).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].docNameFilter).toEqual('');
        expect(couchbaseApi.retrieveDocuments).not.toHaveBeenCalled();
    }));

    it('should notificate an alert message when trying to load documents list with an invalid filter or when the api gives an error',
    inject(function(couchbaseApi, notifyService) {
        var bucketName = 'company',
            pageNumber = 1,
            activeTab = 0,
            filter = 'someKey_*_incorrect';

        cbDocsEditorController.docsTabs[0].searchActive = true;
        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab, filter);

        expect(couchbaseApi.retrieveDocuments).not.toHaveBeenCalled();
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});

        filter = 123;
        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab, filter);

        expect(couchbaseApi.retrieveDocuments).not.toHaveBeenCalled();
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});

        filter = null;
        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab, filter);

        expect(couchbaseApi.retrieveDocuments).not.toHaveBeenCalled();
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});

        couchbaseApi.mock.setRejectRetrieveDocuments(true);
        cbDocsEditorController.getDocuments({name: bucketName}, pageNumber, activeTab);

        expect(couchbaseApi.retrieveDocuments).toHaveBeenCalledWith(bucketName, 0, 300, undefined, undefined, jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
    }));

    it('should load properly the specified couch document when it exists',
    inject(function(couchbaseApi, notifyService) {
        var bucketName = 'company-portal',
            documentName = 'buildConfig',
            rev = '10-00000644e477e5ff0000000000000000',
            documentContent = {
                's3Context': '//company-portal3.s3.amazonaws.com/',
                's3ContextBuild': '//company-portal-builds.s3.amazonaws.com/',
                'noCacheContext': '//company-portal3.s3.amazonaws.com/',
                'noCacheContextBuild': '//company-portal-builds.s3.amazonaws.com/',
                'containerFileName': 'index.html',
                'facebookReferenceParameter': 'signed_request',
                'buildMap': {
                    'main': 'main-app',
                    'fcb': 'fcb-app',
                    'sth': 'sth-app',
                    'default': 'main-app',
                    'widget': 'widget-app'
                }
            },
            activeTab = 0;

        var result;

        result = cbDocsEditorController.getDocument(bucketName, documentName, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(cbDocsEditorController.docsTabs[0].documentRev).toEqual(rev);
        expect(cbDocsEditorController.docsTabs[0].documentContent).toEqual(JSON.stringify(documentContent, null, 4));
        expect(cbDocsEditorController.docsTabs[0].documentContentOrig).toEqual(JSON.stringify(documentContent, null, 4));
        expect(result.$$state).toEqual({ status: 1,  value: undefined });
    }));

    it('should publish a Foundation \'open modal\' event and return a rejected promise when trying to get a document while having an open document with unsaved changes',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName = 'company-portal',
            documentName = 'buildConfig',
            activeTab = 0,
            result;

        cbDocsEditorController.docsTabs[activeTab].documentContentOrig = '{}';
        cbDocsEditorController.docsTabs[activeTab].documentContent = '{ "some": "test" }';

        result = cbDocsEditorController.getDocument(bucketName, documentName, activeTab);

        expect(couchbaseApi.retrieveDocument).not.toHaveBeenCalled();
        expect(FoundationApi.publish).toHaveBeenCalledWith('docNotSavedModal', 'open');
        expect(result.$$state).toEqual({ status: 2,  value: undefined });
    }));

    it('should notificate an alert message when trying to load a given document and api returns an error (not found/other)',
    inject(function(couchbaseApi, notifyService) {
        var bucketName1 = 'company-portal',
            bucketName2 = 'fake',
            documentName = 'buildConfig',
            activeTab = 0,
            result;

        couchbaseApi.mock.setRejectRetrieveDocument(true);
        result = cbDocsEditorController.getDocument(bucketName1, documentName, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName1, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
        expect(result.$$state).toEqual({ status: 2,  value: undefined });

        couchbaseApi.mock.setRejectRetrieveDocument(404);
        result = cbDocsEditorController.getDocument(bucketName2, documentName, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName2, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
        expect(result.$$state).toEqual({ status: 2,  value: undefined });
    }));

    it('should save the current document when no editor annotations and server revision is equal to current one',
    inject(function(couchbaseApi, notifyService) {
        var bucketName = 'company-portal',
            documentName = 'buildConfig',
            rev = '10-00000644e477e5ff0000000000000000',
            documentContent = '{"s3Context":"//company-portal3.s3.amazonaws.com/","s3ContextBuild":"//company-portal-builds.s3.amazonaws.com/","noCacheContext":"//company-portal3.s3.amazonaws.com/","noCacheContextBuild":"//company-portal-builds.s3.amazonaws.com/","containerFileName":"index.html","facebookReferenceParameter":"signed_request","buildMap":{"main":"main-app","fcb":"fcb-app","sth":"sth-app","default":"main-app","widget":"widget-app"}}',
            activeTab = 0,
            saveDocumentPromise;

        saveDocumentPromise = cbDocsEditorController.saveDocument(bucketName, documentName, rev, documentContent, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(couchbaseApi.updateDocument).toHaveBeenCalledWith(bucketName, documentName, JSON.parse(documentContent), jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'success', msg: jasmine.any(String)});
        expect(cbDocsEditorController.docsTabs[0].documentName).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentRev).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentContent).toEqual(null);
        expect(cbDocsEditorController.docsTabs[0].documentContentOrig).toEqual(null);
        expect(saveDocumentPromise.$$state).toEqual({ status: 1,  value: [] });
    }));

    it('should notificate an alert message when trying to save a document with annotated errors in code editor',
    inject(function(couchbaseApi, notifyService, $filter) {
        var bucketName, documentName, rev, documentContent, activeTab, saveDocumentPromise, errorsMsg;

        bucketName = 'company-portal';
        documentName = 'buildConfig';
        rev = '10-00000644e477e5ff0000000000000000';
        documentContent = '{"s3Context":"//company-portal3.s3.amazonaws.com/","s3ContextBuild":"//company-portal-builds.s3.amazonaws.com/","noCacheContext":"//company-portal3.s3.amazonaws.com/","noCacheContextBuild":"//company-portal-builds.s3.amazonaws.com/","containerFileName":"index.html","facebookReferenceParameter":"signed_request","buildMap":{"main":"main-app","fcb":"fcb-app","sth":"sth-app","default":"main-app","widget":"widget-app"}}';
        activeTab = 0;
        cbDocsEditorController.docsTabs[activeTab].editorInstance = {
            session: {
                $annotations: [
                    {
                        type: 'a',
                        row: '1',
                        column: '22',
                        text: 'syntax error'
                    },
                    {
                        type: 'b',
                        row: '5',
                        column: '10',
                        text: 'syntax error'
                    }
                ]
            }
        };
        errorsMsg = $filter('translate')('atRowColumnText', {
            0: 'a',
            1: '1',
            2: '22',
            3: 'syntax error'
        });
        errorsMsg += '<br/>';
        errorsMsg += $filter('translate')('atRowColumnText', {
            0: 'b',
            1: '5',
            2: '10',
            3: 'syntax error'
        });

        saveDocumentPromise = cbDocsEditorController.saveDocument(bucketName, documentName, rev, documentContent, activeTab);

        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: errorsMsg});
        expect(saveDocumentPromise.$$state).toEqual({ status: 2,  value: undefined });
    }));

    it('should notificate an alert message when trying to save a document and api returns an error',
    inject(function(couchbaseApi, notifyService) {
        var bucketName, documentName, rev, documentContent, activeTab, saveDocumentPromise;

        bucketName = 'company-portal';
        documentName = 'buildConfig';
        rev = '10-00000644e477e5ff0000000000000000';
        documentContent = '{"s3Context":"//company-portal3.s3.amazonaws.com/","s3ContextBuild":"//company-portal-builds.s3.amazonaws.com/","noCacheContext":"//company-portal3.s3.amazonaws.com/","noCacheContextBuild":"//company-portal-builds.s3.amazonaws.com/","containerFileName":"index.html","facebookReferenceParameter":"signed_request","buildMap":{"main":"main-app","fcb":"fcb-app","sth":"sth-app","default":"main-app","widget":"widget-app"}}';
        activeTab = 0;

        couchbaseApi.mock.setRejectRetrieveDocument(true);
        saveDocumentPromise = cbDocsEditorController.saveDocument(bucketName, documentName, rev, documentContent, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});

        couchbaseApi.mock.setRejectRetrieveDocument(false);
        couchbaseApi.mock.setRejectUpdateDocument(true);
        saveDocumentPromise = cbDocsEditorController.saveDocument(bucketName, documentName, rev, documentContent, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(couchbaseApi.updateDocument).toHaveBeenCalledWith(bucketName, documentName, JSON.parse(documentContent), jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
        expect(saveDocumentPromise.$$state).toEqual({ status: 2,  value: undefined });
    }));

    it('should notificate an alert message when trying to save a document that already changed on the server (consistency control)',
    inject(function(couchbaseApi, notifyService) {
        var bucketName = 'company-portal',
            documentName = 'buildConfig',
            rev = '10-00000644e477e5ff0000000000000001',
            documentContent = '{"s3Context":"//company-portal3.s3.amazonaws.com/","s3ContextBuild":"//company-portal-builds.s3.amazonaws.com/","noCacheContext":"//company-portal3.s3.amazonaws.com/","noCacheContextBuild":"//company-portal-builds.s3.amazonaws.com/","containerFileName":"index.html","facebookReferenceParameter":"signed_request","buildMap":{"main":"main-app","fcb":"fcb-app","sth":"sth-app","default":"main-app","widget":"widget-app"}}',
            activeTab = 0,
            saveDocumentPromise = cbDocsEditorController.saveDocument(bucketName, documentName, rev, documentContent, activeTab);

        //expect(couchbaseApi.updateDocument).toHaveBeenCalledWith(bucketName, documentName, JSON.parse(documentContent), jasmine.any(Function), jasmine.any(Function));
        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucketName, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(notifyService.addMessage).toHaveBeenCalledWith(jasmine.any(Object));
    }));

    it('should create a new document when params supplied properly and no error from api',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, activeTab, documentContent, doc;

        bucket = {name: 'company-portal' };
        pageNumber = 1;
        documentName = 'testDoc';
        activeTab = 0;
        documentContent = undefined;
        doc = {
          'click': 'to edit',
          'new in 2.0': 'there are no reserved field names'
        };

        cbDocsEditorController.createDocument(bucket, pageNumber, documentName, activeTab, documentContent);

        expect(couchbaseApi.createDocument).toHaveBeenCalledWith(bucket.name, documentName, doc, jasmine.any(Function), jasmine.any(Function));
        expect(FoundationApi.publish).toHaveBeenCalledWith('saveAsModal', 'close');
        expect(FoundationApi.publish).toHaveBeenCalledWith('newDocModal', 'close');
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'success', msg: jasmine.any(String)});

        documentContent = '{"some":"test"}';
        doc = {'some': 'test'};

        cbDocsEditorController.createDocument(bucket, pageNumber, documentName, activeTab, documentContent);

        expect(couchbaseApi.createDocument).toHaveBeenCalledWith(bucket.name, documentName, doc, jasmine.any(Function), jasmine.any(Function));
        expect(FoundationApi.publish).toHaveBeenCalledWith('saveAsModal', 'close');
        expect(FoundationApi.publish).toHaveBeenCalledWith('newDocModal', 'close');
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'success', msg: jasmine.any(String)});
    }));

    it('should set errorExistingDocument flag when trying to create a document with an existing key',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, activeTab, documentContent, doc;

        bucket = {name: 'company-portal' };
        pageNumber = 1;
        documentName = 'testDoc';
        activeTab = 0;
        documentContent = '{"some":"test"}';
        doc = {'some': 'test'};

        couchbaseApi.mock.setRejectCreateDocument(true);
        couchbaseApi.mock.setDuplicatedDocumentKey(true);
        cbDocsEditorController.createDocument(bucket, pageNumber, documentName, activeTab, documentContent);

        expect(couchbaseApi.createDocument).toHaveBeenCalledWith(bucket.name, documentName, doc, jasmine.any(Function), jasmine.any(Function));
        expect(FoundationApi.publish).not.toHaveBeenCalled();
        expect(cbDocsEditorController.errorExistingDocument).toBe(true);
    }));

    it('should notificate an alert message when trying to create a document and api returns error',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, activeTab, documentContent, doc;

        bucket = {name: 'company-portal' };
        pageNumber = 1;
        documentName = 'testDoc';
        activeTab = 0;
        documentContent = '{"some":"test"}';
        doc = {'some': 'test'};

        couchbaseApi.mock.setRejectCreateDocument(true);
        couchbaseApi.mock.setDuplicatedDocumentKey(false);
        cbDocsEditorController.createDocument(bucket, pageNumber, documentName, activeTab, documentContent);

        expect(FoundationApi.publish).toHaveBeenCalledWith('saveAsModal', 'close');
        expect(FoundationApi.publish).toHaveBeenCalledWith('newDocModal', 'close');
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
    }));

    it('should delete current document when params supplied properly and no error from api',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, activeTab;

        bucket = {name: 'company-portal' };
        pageNumber = 1;
        documentName = 'testDoc';
        activeTab = 0;

        cbDocsEditorController.deleteDocument(bucket, pageNumber, documentName, activeTab);

        expect(couchbaseApi.deleteDocument).toHaveBeenCalledWith(bucket.name, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(FoundationApi.publish).toHaveBeenCalledWith('deleteDocModal', 'close');
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'success', msg: jasmine.any(String)});
    }));

    it('should notificate an alert message when trying to delete current document and api returns an error',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, activeTab;

        bucket = {name: 'company-portal' };
        pageNumber = 1;
        documentName = 'testDoc';
        activeTab = 0;

        couchbaseApi.mock.setRejectDeleteDocument(true);
        cbDocsEditorController.deleteDocument(bucket, pageNumber, documentName, activeTab);

        expect(couchbaseApi.deleteDocument).toHaveBeenCalledWith(bucket.name, documentName, jasmine.any(Function), jasmine.any(Function));
        expect(FoundationApi.publish).toHaveBeenCalledWith('deleteDocModal', 'close');
        expect(notifyService.addMessage).toHaveBeenCalledWith({type: 'alert', msg: jasmine.any(String)});
    }));

    it('should save current document before changing to requested one when current document have no errors and requested one exists',
    inject(function(couchbaseApi, notifyService, FoundationApi, $rootScope) {
        var bucketName, pageNumber, documentName, rev, activeTab;

        bucket = {name: 'company-portal' };
        documentName = 'testDoc';
        rev = '10-00000644e477e5ff0000000000000000';
        documentContent = '{"some":"test"}';
        activeTab = 0;
        docToChange = 'reqDoc';

        couchbaseApi.mock.setRejectRetrieveDocument(false);
        couchbaseApi.mock.setRejectUpdateDocument(false);
        cbDocsEditorController.saveAndChangeDoc(bucket, documentName, rev, documentContent, activeTab, docToChange);
        $rootScope.$digest();

        expect(FoundationApi.publish).toHaveBeenCalledWith('docNotSavedModal', 'close');
        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucket.name, docToChange, jasmine.any(Function), jasmine.any(Function));
    }));

    it('should get requested document without saving current one properly',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucketName, pageNumber, documentName, rev, activeTab;

        bucket = {name: 'company-portal' };
        activeTab = 0;
        docToChange = 'reqDoc';

        couchbaseApi.mock.setRejectRetrieveDocument(false);
        cbDocsEditorController.changeDocWithoutSaving(bucket, activeTab, docToChange);

        expect(cbDocsEditorController.docsTabs[activeTab].documentContentOrig).toEqual(cbDocsEditorController.docsTabs[activeTab].documentContent);
        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucket.name, docToChange, jasmine.any(Function), jasmine.any(Function));
    }));

    it('should search for a specified document when bucket, document key and activeTab provided correctly and document key has no wildcard',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucket,
            documentName,
            rev,
            documentContent,
            activeTab;

        bucket = {
            name: 'company-portal'
        };
        documentKey = 'buildConfig';
        rev = '10-00000644e477e5ff0000000000000000';
        documentContent = {
            's3Context': '//company-portal3.s3.amazonaws.com/',
            's3ContextBuild': '//company-portal-builds.s3.amazonaws.com/',
            'noCacheContext': '//company-portal3.s3.amazonaws.com/',
            'noCacheContextBuild': '//company-portal-builds.s3.amazonaws.com/',
            'containerFileName': 'index.html',
            'facebookReferenceParameter': 'signed_request',
            'buildMap': {
                'main': 'main-app',
                'fcb': 'fcb-app',
                'sth': 'sth-app',
                'default': 'main-app',
                'widget': 'widget-app'
            }
        };
        activeTab = 0;

        cbDocsEditorController.searchDocuments(bucket, documentKey, activeTab);

        expect(couchbaseApi.retrieveDocument).toHaveBeenCalledWith(bucket.name, documentKey, jasmine.any(Function), jasmine.any(Function));
        expect(cbDocsEditorController.docsTabs[0].documentRev).toEqual(rev);
        expect(cbDocsEditorController.docsTabs[0].documentContent).toEqual(JSON.stringify(documentContent, null, 4));
        expect(cbDocsEditorController.docsTabs[0].documentContentOrig).toEqual(JSON.stringify(documentContent, null, 4));
    }));

    it('should search for a specified document when bucket, document key and activeTab provided correctly and document key has valid wildcard',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucket,
            filter = 'someKey_*',
            activeTab = 0;

        bucket = {
            name: 'company'
        };

        cbDocsEditorController.searchDocuments(bucket, filter, activeTab);

        expect(cbDocsEditorController.docsTabs[0].searchActive).toBe(true);
        expect(couchbaseApi.retrieveDocuments).toHaveBeenCalledWith(bucket.name, 0, 300, 'someKey_!', 'someKey_}', jasmine.any(Function), jasmine.any(Function));
    }));

    it('should clean the previous search of specific document/s and restore the original paginated documents list',
    inject(function(couchbaseApi, notifyService, FoundationApi) {
        var bucket,
            activePage,
            activeTab;

        bucket = {
            name: 'company'
        };
        activePage = 23;
        activeTab = 0;

        cbDocsEditorController.cleanSearchDocuments(bucket, activePage, activeTab);

        expect(cbDocsEditorController.docsTabs[activeTab].searchActive).toBe(false);
        expect(couchbaseApi.retrieveDocuments).toHaveBeenCalledWith(bucket.name, 6600, 300, undefined, undefined, jasmine.any(Function), jasmine.any(Function));
    }));

});
