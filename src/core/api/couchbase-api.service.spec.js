describe('Couchbase API Service', function() {
    var retrieveBucketsRequestHandler,
        retrieveDocumentsRequestHandler,
        updateDocumentsRequestHandler,
        deleteDocumentsRequestHandler;

    beforeEach(function() {
        module('jmh.couchbase-api');
    });

    beforeEach(inject(function($httpBackend) {
        retrieveDocumentsRequestHandler = $httpBackend.when('GET', new RegExp('/cb-api/pools/default/buckets/.*/docs.*'));
        updateDocumentsRequestHandler = $httpBackend.when('POST', new RegExp('/cb-api/pools/default/buckets/.*/docs.*'));
        deleteDocumentsRequestHandler = $httpBackend.when('DELETE', new RegExp('/cb-api/pools/default/buckets/.*/docs.*'));
        retrieveBucketsRequestHandler = $httpBackend.when('GET', new RegExp('/cb-api/pools/default/buckets.*'));
    }));

    it('should throw an error when trying to retrieve buckets with an incorrect param',
    inject(function(couchbaseApi) {
        var successCallback, errorCallback;

        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.retrieveBuckets(successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        errorCallback = 'a';
        expect(function(){ couchbaseApi.retrieveBuckets(successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');

    }));

    it('should retrieve all buckets when no params provided or params are the callback functions',
    inject(function(couchbaseApi, $httpBackend) {
        var successCallback, errorCallback, resource, isSuccess, isError;

        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        retrieveBucketsRequestHandler.respond(200, ['OK']);
        resource = couchbaseApi.retrieveBuckets(successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual(['OK']);
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        retrieveBucketsRequestHandler.respond(404, ['KO']);
        resource = couchbaseApi.retrieveBuckets(successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual([]);
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when trying to retrieve a bucket with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, successCallback, errorCallback;

        bucketName = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.retrieveBucket(bucketName, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.retrieveBucket(bucketName, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.retrieveBucket(bucketName, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');
    }));

    it('should retrieve the specified bucket when valid bucket name provided with or without callback functions',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        retrieveBucketsRequestHandler.respond(200, {result: 'OK'});
        resource = couchbaseApi.retrieveBucket(bucketName, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({result: 'OK'});
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        retrieveBucketsRequestHandler.respond(404, {result: 'KO'});
        resource = couchbaseApi.retrieveBucket(bucketName, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({});
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when trying to retrieve documents with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback;

        bucketName = null;
        skipDocs = null;
        limitDocs = null;
        startKey = null;
        endKey = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'skipDocs must be a number', 'couchbase-api.service.js');

        skipDocs = 10;
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'limitDocs must be a number', 'couchbase-api.service.js');

        limitDocs = 200;
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');

        errorCallback = function(){};
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'startKey, if provided, must be a valid string', 'couchbase-api.service.js');

        startKey = 'someDoc';
        expect(function(){ couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'endKey, if provided, must be a valid string', 'couchbase-api.service.js');
    }));

    it('should retrieve the documents of the specified bucket when valid params provided',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        skipDocs = 0;
        limitDocs = 100;
        startKey = 'a';
        endKey = 'ccc';
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        retrieveDocumentsRequestHandler.respond(200, {result: 'OK'});
        resource = couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs?endkey=%22ccc%22&include_docs=true&inclusive_end=false&limit=100&skip=0&startkey=%22a%22');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({result: 'OK'});
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        retrieveDocumentsRequestHandler.respond(404, {result: 'KO'});
        resource = couchbaseApi.retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs?endkey=%22ccc%22&include_docs=true&inclusive_end=false&limit=100&skip=0&startkey=%22a%22');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({});
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when trying to retrieve a document with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, documentKey, successCallback, errorCallback;

        bucketName = null;
        documentKey = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'documentKey must be a string', 'couchbase-api.service.js');

        documentKey = 'someDoc';
        expect(function(){ couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');
    }));

    it('should retrieve the specified document when valid bucket name and document name provided with or without callback functions',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, documentKey, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        documentKey = 'someDoc';
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        retrieveDocumentsRequestHandler.respond(200, {result: 'OK'});
        resource = couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({result: 'OK'});
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        retrieveDocumentsRequestHandler.respond(404, {result: 'KO'});
        resource = couchbaseApi.retrieveDocument(bucketName, documentKey, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({});
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when trying to create a document with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, documentKey, content, successCallback, errorCallback;

        bucketName = null;
        documentKey = null;
        content = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'documentKey must be a string', 'couchbase-api.service.js');

        documentKey = 'someDoc';
        expect(function(){ couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'content must be a valid object literal', 'couchbase-api.service.js');

        content = {};
        expect(function(){ couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');
    }));

    it('should return a rejected promise and call errorCallback when document attempting to create already exists or server responds with error',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, documentKey, successCallback, errorCallback, resource, isSuccess, isError, errorParam;

        bucketName = 'company';
        documentKey = 'someDoc';
        content = {};
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(response){
            isSuccess = false;
            isError = true;
            errorParam = response;
        };
        retrieveDocumentsRequestHandler.respond(200, {result: 'OK'});
        resource = couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({});
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect(errorParam).toBe(true);

        retrieveDocumentsRequestHandler.respond(500, {result: 'KO'});
        resource = couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual({});
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
        expect(errorParam).toBe(false);
    }));

    it('should create a document when it doesn\'t exist yet in this bucket and all params are right',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, documentKey, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        documentKey = 'someDoc';
        content = {};
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(response){
            isSuccess = false;
            isError = true;
        };
        retrieveDocumentsRequestHandler.respond(404, {});
        updateDocumentsRequestHandler.respond(200, ['OK']);
        resource = couchbaseApi.createDocument(bucketName, documentKey, content, successCallback, errorCallback);
        $httpBackend.expectGET('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.expectPOST('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource.$$state.value))).toEqual(['OK']);
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);
    }));

    it('should throw an error when trying to delete a document with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, documentKey, successCallback, errorCallback;

        bucketName = null;
        documentKey = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'documentKey must be a string', 'couchbase-api.service.js');

        documentKey = 'someDoc';
        expect(function(){ couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');
    }));

    it('should delete the specified document when valid bucket name and document name provided with or without callback functions',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, documentKey, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        documentKey = 'someDoc';
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        deleteDocumentsRequestHandler.respond(200, ['OK']);
        resource = couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback);
        $httpBackend.expectDELETE('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual(['OK']);
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        deleteDocumentsRequestHandler.respond(404, {result: 'KO'});
        resource = couchbaseApi.deleteDocument(bucketName, documentKey, successCallback, errorCallback);
        $httpBackend.expectDELETE('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual([]);
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when trying to update a document with an incorrect param',
    inject(function(couchbaseApi) {
        var bucketName, documentKey, content, successCallback, errorCallback;

        bucketName = null;
        documentKey = null;
        content = null;
        successCallback = 1;
        errorCallback = 'a';
        expect(function(){ couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'bucketName must be a string', 'couchbase-api.service.js');

        bucketName = 'company';
        expect(function(){ couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'documentKey must be a string', 'couchbase-api.service.js');

        documentKey = 'someDoc';
        expect(function(){ couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'content must be a valid object literal', 'couchbase-api.service.js');

        content = {};
        expect(function(){ couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'successCallback, if provided, must be a function', 'couchbase-api.service.js');

        successCallback = function(){};
        expect(function(){ couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback); })
        .toThrowError(TypeError, 'errorCallback, if provided, must be a function', 'couchbase-api.service.js');
    }));

    it('should update the specified document when valid bucket name and document name provided with or without callback functions',
    inject(function(couchbaseApi, $httpBackend) {
        var bucketName, documentKey, successCallback, errorCallback, resource, isSuccess, isError;

        bucketName = 'company';
        documentKey = 'someDoc';
        content = {};
        successCallback = function(){
            isSuccess = true;
            isError = false;
        };
        errorCallback = function(){
            isSuccess = false;
            isError = true;
        };
        updateDocumentsRequestHandler.respond(200, ['OK']);
        resource = couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback);
        $httpBackend.expectPOST('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual(['OK']);
        expect(isSuccess).toBe(true);
        expect(isError).toBe(false);

        updateDocumentsRequestHandler.respond(404, {result: 'KO'});
        resource = couchbaseApi.updateDocument(bucketName, documentKey, content, successCallback, errorCallback);
        $httpBackend.expectPOST('/cb-api/pools/default/buckets/company/docs/someDoc');
        $httpBackend.flush();

        expect(angular.fromJson(angular.toJson(resource))).toEqual([]);
        expect(isSuccess).toBe(false);
        expect(isError).toBe(true);
    }));

    it('should throw an error when attempting to call functions not implemented yet',
    inject(function(couchbaseApi, $httpBackend) {
        expect(function(){ couchbaseApi.createBucket(); })
        .toThrowError(Error, 'method "createBucket" not implemented yet');

        expect(function(){ couchbaseApi.deleteBucket(); })
        .toThrowError(Error, 'method "deleteBucket" not implemented yet');
    }));
});