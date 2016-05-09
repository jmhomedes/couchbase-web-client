module.exports = function(karma) {
    karma.set({
        /**
         * From where to look for files, starting with the location of this file.
         */
        basePath: '../',

        /**
         * This is the list of file patterns to load into the browser during testing.
         */
        files: [
            // jshint ignore:start
            <% scripts.forEach( function ( file ) { %>'<%= file %>',
            <% }); %>
            // jshint ignore:end
            'src/**/*.module.js',
            'src/**/*.js'
        ],
        exclude: [
            'src/**/_*.js'
        ],
        frameworks: ['jasmine'],
        plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher', 'karma-firefox-launcher', 'karma-chrome-launcher',
            'karma-spec-reporter', 'karma-junit-reporter', 'karma-coverage'
        ],
        preprocessors: {
            'src/**/!(*.spec|*.mock)+(.js)': 'coverage'
        },

        /**
         * How to report
         */
        reporters: ['spec', 'junit', 'coverage'],
        specReporter: {
            maxLogLines: 5,         // limit number of lines logged per test
            suppressErrorSummary: false,  // do not print error summary
            suppressFailed: false,  // do not print information about failed tests
            suppressPassed: false,  // do not print information about passed tests
            suppressSkipped: false  // do not print information about skipped tests
        },
        junitReporter: {
            outputDir: 'reports/junit/',
            outputFile: 'junit-report.xml' // JUnit test results for sonar
        },
        coverageReporter: {
            reporters:[
                {type: 'lcov', dir: 'reports/lcov/'}, // Sonar + HTML
                {type: 'cobertura', dir: 'reports/cobertura/', file: 'coverage-report.xml'}, // Jenkins
                //{type: 'text'}, // CLI
                {type: 'text-summary'} // CLI
            ],
        },

        /**
         * How long will Karma wait for a message from a browser before disconnecting from it (in ms).
         * @type {Number}
         */
        browserNoActivityTimeout: 30000,

        /**
         * On which port should the browser connect, on which port is the test runner
         * operating, and what is the URL path for the browser to use.
         */
        port: 9018,
        runnerPort: 9100,
        urlRoot: '/',

        /**
         * Disable file watching by default.
         */
        autoWatch: false,

        /**
         * The list of browsers to launch to test on. This includes only "Firefox" by
         * default, but other browser names include:
         * Chrome, ChromeCanary, Firefox, Opera, Safari, PhantomJS
         *
         * Note that you can also use the executable name of the browser, like "chromium"
         * or "firefox", but that these vary based on your operating system.
         *
         * You may also leave this blank and manually navigate your browser to
         * http://localhost:9018/ when you're running tests. The window/tab can be left
         * open and the tests will automatically occur there during the build. This has
         * the aesthetic advantage of not launching a browser every time you save.
         */
        browsers: [
            'PhantomJS' //'Chrome', 'Firefox'
        ]
    });
};
