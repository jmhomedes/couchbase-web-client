(function(){

    angular.module( 'jmh.notify')
    .factory('notifyService', notifyService);

    function notifyService() {
        var _msgQueue = [], // array of {type: 'success/warning/info/alert/secondary [radius/round]', msg: 'text to show'}
            _timeout = 8000,
            maxSimultMsgs = 1;

        function getAllMessages(){
            return _msgQueue;
        }

        // @msg: {type: 'success/warning/info/alert/secondary [radius/round]', msg: 'text to show'}
        function addMessage(msg){
            if(_msgQueue.length === maxSimultMsgs){
                _msgQueue.splice((_msgQueue.length-1), 1);
            }
            _msgQueue.push(msg);
        }

        function removeMessages(msgArray){
            var i, j;
            for(i = 0; i < msgArray.length; i++){
                for(j = 0; j < _msgQueue.length; j++){
                    if(msgArray[i] === _msgQueue[j]){
                        _msgQueue.splice(j, 1);
                        break;
                    }
                }
            }
        }

        function removeFirst(){
            return _msgQueue.splice(0,1);
        }

        function getTimeout(){
            return _timeout;
        }

        function setTimeout(timeout){
            _timeout = timeout;
        }

        return {
            getAllMessages: getAllMessages,
            addMessage: addMessage,
            removeFirst: removeFirst,
            removeMessages: removeMessages,
            getTimeout: getTimeout,
            setTimeout: setTimeout
        };
    }

})();