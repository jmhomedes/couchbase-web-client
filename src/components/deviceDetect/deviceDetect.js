(function(){

    angular.module('jmh.deviceDetect', [])
    .directive('jmhDeviceDetect', deviceDetect);

    deviceDetect.$inject = [];
    function deviceDetect(){
        var dirObj = {
            restrict: 'E',
            scope: {},
            bindToController: {
                displayMode: '='
            },
            controllerAs: 'deviceDetect',
            controller: deviceDetectController,
            replace: true,
            template: '<div class="display-mode"><span class="mobile"></span><span class="tablet"></span><span class="desktop"></span></div>'
        };

        deviceDetectController.$inject = ['$element', '$window', '$timeout'];
        function deviceDetectController($element, $window, $timeout) {
            var vm = this,
                markers = $element.find('span'),
                currentDisplayMode = null;

            angular.element($window).on('resize', updateDisplayMode);
            updateDisplayMode();

            function updateDisplayMode() {
                update();
                if(vm.displayMode !== currentDisplayMode){
                    $timeout(function(){ vm.displayMode = currentDisplayMode; });
                }
            }

            function isVisible(element) {
                return element &&
                    element.style.display != 'none' &&
                    element.offsetWidth &&
                    element.offsetHeight;
            }

            function update() {
                angular.forEach(markers, function (element) {
                    if (isVisible(element)) {
                        currentDisplayMode = element.className;
                        return false;
                    }
                });
            }
        }
        return dirObj;
    }

})();