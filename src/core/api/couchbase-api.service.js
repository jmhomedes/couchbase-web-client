(function(){

    /**
     * HTTP GET "class" actions: Resource.action([parameters], [success], [error])
     * non-GET "class" actions: Resource.action([parameters], postData, [success], [error])
     * non-GET instance actions: instance.$action([parameters], [success], [error])
     *
     * Default actions:
     * {
     *   'get':    {method:'GET'},
     *   'save':   {method:'POST'},
     *   'query':  {method:'GET', isArray:true},
     *   'remove': {method:'DELETE'},
     *   'delete': {method:'DELETE'}
     * }
     */


    angular.module('jmh.couchbase-api', [
        'ngResource'
    ])
    .factory('couchbaseApi', couchbaseApi);

    couchbaseApi.$inject = ['$resource', '$q'];
    function couchbaseApi($resource, $q){

        // "class" references:
        var _resources = {
            'Buckets': $resource('/cb-api/pools/default/buckets/:bucketName'),
            'Documents': $resource('/cb-api/pools/default/buckets/:bucketName/docs/:documentKey', {}, {
                'update': {
                    method: 'POST',
                    isArray: true
                },
                'remove': {
                    method: 'DELETE',
                    isArray: true
                }
            })
        };

        var cbApi = {
            retrieveBuckets: retrieveBuckets,
            retrieveBucket: retrieveBucket,
            createBucket: createBucket,
            deleteBucket: deleteBucket,
            retrieveDocuments: retrieveDocuments,
            retrieveDocument: retrieveDocument,
            createDocument: createDocument,
            deleteDocument: deleteDocument,
            updateDocument: updateDocument
        };

        function retrieveBuckets(successCallback, errorCallback){
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            return _resources.Buckets.query(successCallback, errorCallback);
        }

        function retrieveBucket(bucketName, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            return _resources.Buckets.get({bucketName: bucketName}, successCallback, errorCallback);
        }

        function createBucket(){
            throw new Error('method "createBucket" not implemented yet');
        }

        function deleteBucket(){
            throw new Error('method "deleteBucket" not implemented yet');
        }

        function retrieveDocuments(bucketName, skipDocs, limitDocs, startKey, endKey, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(skipDocs) !== 'number'){
                throw new TypeError('skipDocs must be a number', 'couchbase-api.service.js');
            }
            if(typeof(limitDocs) !== 'number'){
                throw new TypeError('limitDocs must be a number', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            var invalidStartKey = typeof(startKey) !== 'undefined' && (typeof(startKey) !== 'string' || !startKey);
            if(invalidStartKey){
                throw new TypeError('startKey, if provided, must be a valid string', 'couchbase-api.service.js');
            }
            var invalidEndKey = typeof(endKey) !== 'string' || !endKey;
            if(!invalidStartKey && startKey && invalidEndKey){
                throw new TypeError('endKey, if provided, must be a valid string', 'couchbase-api.service.js');
            }

            var queryParams = {
                bucketName: bucketName,
                include_docs: true,
                skip: skipDocs,
                limit: limitDocs,
                inclusive_end:false
            };

            if(!invalidStartKey && !invalidEndKey){
                queryParams.startkey = '"'+startKey+'"';
                queryParams.endkey = '"'+endKey+'"';
            }

            return _resources.Documents.get(queryParams, successCallback, errorCallback);
        }

        function retrieveDocument(bucketName, documentKey, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(documentKey) !== 'string'){
                throw new TypeError('documentKey must be a string', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            return _resources.Documents.get({bucketName: bucketName, documentKey: documentKey}, successCallback, errorCallback);
        }

        function createDocument(bucketName, documentKey, content, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(documentKey) !== 'string'){
                throw new TypeError('documentKey must be a string', 'couchbase-api.service.js');
            }
            if(!content || typeof(content) !== 'object' || typeof(content.length) !== 'undefined'){
                throw new TypeError('content must be a valid object literal', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }

            var deferred = $q.defer();
            retrieveDocument(bucketName, documentKey).$promise.then(success, fail);

            function success(document){
                errorCallback(true);
                return deferred.reject({ $promise: $q.reject(true) });
            }

            function fail(error){
                if(error.status === 404){
                    var aux = _resources.Documents.update({bucketName: bucketName, documentKey: documentKey}, content, function(response){
                        successCallback(response);
                    }, errorCallback);
                    return deferred.resolve(aux);
                }
                else{
                    errorCallback(false);
                    return deferred.reject({ $promise: $q.reject(true) });
                }
            }

            return deferred.promise;
        }

        function deleteDocument(bucketName, documentKey, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(documentKey) !== 'string'){
                throw new TypeError('documentKey must be a string', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            return _resources.Documents.remove({bucketName: bucketName, documentKey: documentKey}, successCallback, errorCallback);
        }

        function updateDocument(bucketName, documentKey, content, successCallback, errorCallback){
            if(typeof(bucketName) !== 'string'){
                throw new TypeError('bucketName must be a string', 'couchbase-api.service.js');
            }
            if(typeof(documentKey) !== 'string'){
                throw new TypeError('documentKey must be a string', 'couchbase-api.service.js');
            }
            if(!content || typeof(content) !== 'object' || typeof(content.length) !== 'undefined'){
                throw new TypeError('content must be a valid object literal', 'couchbase-api.service.js');
            }
            if(typeof(successCallback) !== 'undefined' && typeof(successCallback) !== 'function'){
                throw new TypeError('successCallback, if provided, must be a function', 'couchbase-api.service.js');
            }
            if(typeof(errorCallback) !== 'undefined' && typeof(errorCallback) !== 'function'){
                throw new TypeError('errorCallback, if provided, must be a function', 'couchbase-api.service.js');
            }

            return _resources.Documents.update({bucketName: bucketName, documentKey: documentKey}, content, successCallback, errorCallback);
        }

        return cbApi;
    }

})();