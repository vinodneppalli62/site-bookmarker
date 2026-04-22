(function () {
    'use strict';

    angular.module("questApp").directive('invalidCharValidator', invalidCharValidator);
    invalidCharValidator.$inject = ['$rootScope', "Constants", "appData"];

    function invalidCharValidator($rootScope, Constants, appData) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                if (!ngModel) return;

                element[0].addEventListener("paste", function (event) {

                    var pastedData = event.clipboardData.getData("text") || "";

                    // cells copied from Excel contain trailing CR/LF
                    var windowsLineEndingRegExp = new RegExp("\r\n");
                    var windowsLineEndingRegExpEnd = new RegExp("(\r\n)*\r\n$");

                    if (windowsLineEndingRegExp.test(pastedData)) {
                        // remove trailing CR/LF
                        pastedData = pastedData.replace(windowsLineEndingRegExpEnd, "");
                        // replace CR/LF in the middle with space
                        pastedData = pastedData.replace(windowsLineEndingRegExp, " ");
                    }

                    var invalidChars = pastedData.split("").filter(function (char) {
                        return !Constants.invalidCharRegex.test(char);
                    });

                    event.preventDefault();

                    if (invalidChars.length > 0) {
                        $rootScope.$broadcast("DISPLAY_MSG", {
                            msg: 'Invalid character found, cannot paste.',
                            type: 'warning',
                            showAlert: true
                        });
                    } else {

                        // ---------------------------------------------------
                        // NEW: MAXLENGTH ENFORCEMENT
                        // ---------------------------------------------------
                        var max = parseInt(attrs.maxlength, 10);
                        if (!isNaN(max)) {
                            pastedData = pastedData.substring(0, max);
                        }

                        pastedData = appData.replaceExtendedAsciiValues(pastedData);

                        var target = event.target;
                        var start = target.selectionStart || 0;
                        var end = target.selectionEnd || 0;

                        var newValue =
                            target.value.substring(0, start) +
                            pastedData +
                            target.value.substring(end);

                        target.value = newValue;
                        ngModel.$setViewValue(newValue);
                        ngModel.$render();
                    }
                });
            }
        };
    }
})();