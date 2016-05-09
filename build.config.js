/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    root_dir: 'src',
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_dir: 'build',
    compile_dir: 'bin',
    reports_dir: 'reports',

    /**
     * This is a collection of file patterns that refer to our app code (the
     * stuff in `src/`). These file paths are used in the configuration of
     * build tasks. `js` is all project javascript, less tests. `ctpl` contains
     * our reusable components' (`src/common`) template HTML files, while
     * `atpl` contains the same, but for our app's code. `html` is just our
     * main HTML file, `less` is our main stylesheet, and `unit` contains our
     * app's unit tests.
     */
    app_files: {
        js: [
            '**/*.module.js', '**/*.js',
            '!**/*.mock*.js',
            '!**/*.spec.js', '!**/_*.js'
        ],
        jsunit: ['src/**/*.spec.js'],
        tpl: ['src/**/*.tpl.html'],
        index: ['index.html'],
        css: ['src/**/*.css'],
        img: ['src/**/img/*.*', '!src/**/img/*.db'],
        fonts: ['src/**/fonts/*.*'],
        data: ['src/**/*.json'],
        svg: ['src/**/*.svg']
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: [
            'vendor/angular-mocks/angular-mocks.js'
        ]
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The `vendor_files.css` property holds any CSS files to be automatically
     * included in our app.
     *
     * The `vendor_files.assets` property holds any assets to be copied along
     * with our app's assets. This structure is flattened, so it is not
     * recommended that you use wildcards.
     */
    vendor_files: {
        ace: [
            'vendor/ace-builds/src-min-noconflict/ace.js',
            'vendor/ace-builds/src-min-noconflict/theme-xcode.js',
            'vendor/ace-builds/src-min-noconflict/mode-json.js',
            'vendor/ace-builds/src-min-noconflict/worker-json.js',
            'vendor/ace-builds/src-min-noconflict/ext-searchbox.js'
        ],
        js: [
            'vendor/angular/angular.js',
            'vendor/angular-resource/angular-resource.js',
            'vendor/angular-sanitize/angular-sanitize.js',
            'vendor/angular-cookies/angular-cookies.js',
            'vendor/angular-animate/angular-animate.js',
            'vendor/angular-ui-router/release/angular-ui-router.js',
            'vendor/angular-foundation/src/pagination/pagination.js',
            'vendor/angular-foundation/src/position/position.js',
            'vendor/angular-foundation/src/bindHtml/bindHtml.js',
            'vendor/angular-foundation/src/tooltip/tooltip.js',
            'vendor/foundation-apps/js/angular/foundation.js',
            'vendor/foundation-apps/js/angular/services/foundation.mediaquery.js',
            'vendor/foundation-apps/js/angular/services/foundation.core.js',
            'vendor/foundation-apps/js/angular/services/foundation.core.animation.js',
            'vendor/foundation-apps/js/angular/components/**/*.js',
            //'vendor/api-check/dist/api-check.js',
            'vendor/fastclick/lib/fastclick.js',
            'vendor/angular-ui-ace/ui-ace.js'
        ],
        foundationAppsTpls: [
            'vendor/foundation-apps/js/angular/components/**/*.html'
        ],
        angularFoundationTpls: [
            'vendor/angular-foundation/template/pagination/pagination.html',
            'vendor/angular-foundation/template/tooltip/tooltip-popup.html'
        ],
        css: [
            'vendor/foundation-apps/dist/css/foundation-apps.css',
            'vendor/foundation-icon-fonts/foundation-icons.css'
        ],
        fonts: [
            'vendor/foundation-icon-fonts/**/foundation-icons.{eot,svg,ttf,woff}'
        ]
    }
};
