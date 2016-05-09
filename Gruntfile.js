module.exports = function(grunt) {

    /**
     * Load required Grunt tasks. These are installed based on the versions listed
     * in `package.json` when you do `npm install` in this directory.
     */
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-html-angular-validate');
    grunt.loadNpmTasks('grunt-karma');

    /**
     * Load in our build configuration file.
     */
    var userConfig = require('./build.config.js');

    /**
     * This is the configuration object Grunt uses to give each plugin its
     * instructions.
     */
    var taskConfig = {
        /**
         * We read in our `package.json` file so we can access the package name and
         * version. It's already there, so we don't repeat ourselves here.
         */
        pkg: grunt.file.readJSON('package.json'),

        /**
         * The directories to delete when `grunt clean` is executed.
         */
        clean: {
            build: ['<%= build_dir %>'],
            compile: ['<%= compile_dir %>'],
            reports: ['reports']
        },

        /**
         * HTML validator that accepts angular directive tags/attrs
         */
        htmlangular: {
            options: {
                tmplext: 'tpl.html',
                customattrs: [
                ],
                reportpath: '<%= reports_dir %>/html-angular-validate-report.json'
            },
            files: {
                src: ['<%= app_files.tpl %>']
            }
        },

        /**
         * The `copy` task just copies files from A to B. We use it here to copy
         * our project assets (images, fonts, etc.) and javascripts into
         * `build_dir`, and then to copy the assets to `compile_dir`.
         */
        copy: {
            build_img: {
                files: [{
                    src: ['<%= app_files.img %>'],
                    dest: '<%= build_dir %>/assets/img/',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            build_fonts: {
                files: [{
                    src: ['<%= app_files.fonts %>'],
                    dest: '<%= build_dir %>/assets/fonts/',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            build_svgs: {
                files: [{
                    src: ['<%= app_files.svg %>'],
                    dest: '<%= build_dir %>/assets/svg/',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            build_data: {
                files: [{
                    src: ['<%= app_files.data %>'],
                    dest: '<%= build_dir %>/assets/data/',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            build_vendor_assets: {
                files: [{
                    src: ['<%= vendor_files.fonts %>'],
                    dest: '<%= build_dir %>/assets/fonts/',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            build_appjs: {
                files: [{
                    src: ['<%= app_files.js %>'],
                    dest: '<%= build_dir %>/',
                    cwd: './<%= root_dir %>',
                    expand: true
                }]
            },
            build_vendorjs: {
                files: [{
                    src: ['<%= vendor_files.ace %>', '<%= vendor_files.js %>'],
                    dest: '<%= build_dir %>/',
                    cwd: '.',
                    expand: true
                }]
            },
            build_index: {
                files: [{
                    src: ['<%= root_dir %>/<%= app_files.index %>'],
                    dest: '<%= build_dir %>/',
                    cwd: '.',
                    expand: true
                }]
            },
            compile_assets: {
                files: [{
                    src: ['**'],
                    dest: '<%= compile_dir %>/assets',
                    cwd: '<%= build_dir %>/assets',
                    expand: true
                }]
            },
            compile_acevendorjs: {
                files: [{
                    src: ['<%= vendor_files.ace %>'],
                    dest: '<%= compile_dir %>/assets/js',
                    cwd: '.',
                    expand: true,
                    flatten: true
                }]
            },
            compile_index: {
                files: [{
                    src: ['<%= app_files.index %>'],
                    dest: '<%= compile_dir %>/',
                    cwd: './<%= root_dir %>/',
                    expand: true
                }]
            }
        },

        cssmin: {
            own: {
                files: {
                    '<%= compile_dir %>/assets/css/own-styles.css': ['<%= build_dir %>/assets/css/own-styles.css']
                }
            },
            vendor: {
                files: {
                    '<%= compile_dir %>/assets/css/lib-styles.css': ['<%= build_dir %>/assets/css/lib-styles.css']
                }
            }
        },

        /**
         * `grunt concat` concatenates multiple source files into a single file.
         */
        concat: {
            /**
             * The `build_css` target concatenates compiled CSS and vendor CSS
             * together.
             */
            css: {
                src: [
                    '<%= app_files.css %>'
                ],
                dest: '<%= build_dir %>/assets/css/own-styles.css'
            },
            vendorcss: {
                src: [
                    '<%= vendor_files.css %>'
                ],
                dest: '<%= build_dir %>/assets/css/lib-styles.css'
            },
            compile_js: {
                options: {},
                src: [
                    '<%= build_dir %>/**/*.module.js',
                    '<%= build_dir %>/**/*.js',
                    '!<%= build_dir %>/**/karma-unit.js',
                    '!<%= build_dir %>/**/vendor/**'
                ],
                dest: '<%= compile_dir %>/assets/js/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            compile_vendorjs: {
                options: {},
                src: ['<%= vendor_files.js %>'],
                dest: '<%= compile_dir %>/assets/js/_libs-<%= pkg.version %>.js'
            }
        },

        /**
         * `ngAnnotate` annotates the sources before minifying. That is, it allows us
         * to code without the array syntax.
         */
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= build_dir %>',
                        src: ['<%= app_files.js %>'],
                        dest: '<%= build_dir %>'
                    },
                ],
            }
        },

        /**
         * Minify the sources!
         */
        uglify: {
            compile: {
                options: {
                    mangle: {
                        except: ['ace', 'define', 'require']
                    }
                },
                files: {
                    '<%= concat.compile_js.dest %>': '<%= concat.compile_js.dest %>',
                    '<%= concat.compile_vendorjs.dest %>': '<%= concat.compile_vendorjs.dest %>'
                }
            }
        },

        /**
         * `jshint` defines the rules of our linter as well as which files we
         * should check. This file, all javascript sources, and all our unit tests
         * are linted based on the policies listed in `options`. But we can also
         * specify exclusionary patterns by prefixing them with an exclamation
         * point (!); this is useful when code comes from a third party but is
         * nonetheless inside `src/`.
         */
        jshint: {
            src_code: {
                src: ['<%= app_files.js %>'],
                expand: true,
                cwd: './<%= root_dir %>/'
            },
            test: {
                src: '<%= app_files.jsunit %>'
            },
            gruntfile: {
                src: ['Gruntfile.js', 'build.config.js']
            },
            options: {
                immed: true,
                newcap: true,
                noarg: true,
                sub: true,
                boss: true,
                eqnull: true,
                globals: {}
            }
        },

        /**
         * HTML2JS is a Grunt plugin that takes all of your template files and
         * places them into JavaScript files as strings that are added to
         * AngularJS's template cache. This means that the templates too become
         * part of the initial payload as one JavaScript file. Neat!
         */
        html2js: {
            /**
             * These are the templates from `src`.
             */
            app: {
                options: {
                    base: '<%= root_dir %>'
                },
                src: ['<%= app_files.tpl %>'],
                dest: '<%= build_dir %>/templates-app.js'
            },
            /**
             * These are the templates from `vendors`.
             */
            foundationApps: {
                options: {
                    base: 'vendor/foundation-apps/js/angular/'
                },
                src: ['<%= vendor_files.foundationAppsTpls %>'],
                dest: '<%= build_dir %>/templates-foundationApps.js'
            },
            angularFoundation: {
                options: {
                    base: 'vendor/angular-foundation/'
                },
                src: ['<%= vendor_files.angularFoundationTpls %>'],
                dest: '<%= build_dir %>/templates-angularFoundation.js'
            }
        },

        compress: {
            main: {
                options: {
                    archive: '<%= dist_dir %>/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [{
                    src: ['**'],
                    expand: true,
                    cwd: '<%= compile_dir %>/'
                }]
            }
        },

        /**
         * The Karma configurations.
         */
        karma: {
            options: {
                configFile: '<%= build_dir %>/karma-unit.js'
            },
            unit: {
                port: 9101,
                background: true
            },
            continuous: {
                singleRun: true
            }
        },

        /**
         * The `index` task compiles the `index.html` file as a Grunt template. CSS
         * and JS files co-exist here but they get split apart later.
         */
        index: {

            /**
             * During development, we don't want to have wait for compilation,
             * concatenation, minification, etc. So to avoid these steps, we simply
             * add all script files directly to the `<head>` of `index.html`. The
             * `src` property contains the list of included files.
             */
            build: {
                dir: '<%= build_dir %>', // index.html destination folder
                root: '<%= root_dir %>', // index.html source folder
                src: [
                    '<%= build_dir %>/vendor/angular/angular.js',
                    //'<%= build_dir %>/vendor/api-check/dist/api-check.js',
                    '<%= build_dir %>/vendor/**/*.js',
                    '<%= build_dir %>/**/*.module.js',
                    '<%= build_dir %>/**/*.js',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.foundationApps.dest %>',
                    '<%= concat.vendorcss.dest %>',
                    '<%= concat.css.dest %>'
                ]
            },

            /**
             * When it is time to have a completely compiled application, we can
             * alter the above to include only a single JavaScript and a single CSS
             * file. Now we're back!
             */
            compile: {
                dir: '<%= compile_dir %>', // index.html destination folder
                root: '<%= root_dir %>', // index.html source folder
                src: [
                    '<%= compile_dir %>/assets/**/*.js',
                    '<%= compile_dir %>/assets/**/*.css'
                ]
            }
        },

        /**
         * This task compiles the karma template so that changes to its file array
         * don't have to be managed manually.
         */
        karmaconfig: {
            unit: {
                dir: '<%= build_dir %>',
                src: [
                    '<%= vendor_files.js %>',
                    '<%= html2js.app.dest %>',
                    '<%= html2js.foundationApps.dest %>',
                    '<%= html2js.angularFoundation.dest %>',
                    '<%= test_files.js %>'
                ]
            }
        },

        /**
         * And for rapid development, we have a watch set up that checks to see if
         * any of the files listed below change, and then to execute the listed
         * tasks when they do. This just saves us from having to type "grunt" into
         * the command-line every time we want to see what we're working on; we can
         * instead just leave "grunt watch" running in a background terminal. Set it
         * and forget it, as Ron Popeil used to tell us.
         *
         * But we don't need the same thing to happen for all the files.
         */
        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true
            },

            /**
             * When the Gruntfile changes, we just want to lint it. In fact, when
             * your Gruntfile changes, it will automatically be reloaded!
             */
            gruntfile: {
                files: ['Gruntfile.js', 'build.config.js'],
                tasks: ['default'],
                options: {
                    livereload: false
                }
            },

            /**
             * When our JavaScript source files change, we want to run lint them and
             * run our unit tests.
             */
            jssrc: {
                files: [
                    '<%= app_files.js %>'
                ],
                options: {
                    cwd: './<%= root_dir %>/'
                },
                tasks: ['jshint:src_code', 'karma:unit:run', 'copy:build_appjs']
            },

            /**
             * When assets are changed, copy them. Note that this will *not* copy new
             * files, so this is probably not very useful.
             */
            assets: {
                files: [
                    '<%= app_files.img %>',
                    '<%= app_files.fonts %>',
                    '<%= app_files.svg %>',
                    '<%= app_files.data %>',
                    '<%= vendor_files.fonts %>'
                ],
                tasks: ['copy:build_img', 'copy:build_fonts', 'copy:build_svgs', 'copy:build_data', 'copy:build_vendor_assets']
            },

            /**
             * When index.html changes, we need to compile it.
             */
            html: {
                files: ['<%= root_dir %>/<%= app_files.index %>'],
                tasks: ['default']
            },

            /**
             * When our templates change, we only rewrite the template cache.
             */
            tpls: {
                files: [
                    '<%= app_files.tpl %>'
                ],
                tasks: ['html2js']
            },

            /**
             * When the own CSS files change, we need to copy them.
             */
            css: {
                files: [ '<%= app_files.css %>' ],
                tasks: [ 'concat:css' ]
            },

            /**
             * When the vendor CSS files change, we need to copy them.
             */
            vendorcss: {
                files: [ '<%= vendor_files.css %>' ],
                tasks: [ 'concat:vendorcss' ]
            },

            /**
             * When a JavaScript unit test file changes, we only want to lint it and
             * run the unit tests. We don't want to do any live reloading.
             *
             */
            jsunit: {
                files: [
                    '<%= app_files.jsunit %>'
                ],
                tasks: ['jshint:test', 'karma:unit:run'],
                options: {
                    livereload: false
                }
            }
        }
    };

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');
    grunt.registerTask('watch', ['build', 'karma:unit', 'delta']);

    /**
     * The default task is to build
     * The compile task is to build and compile.
     */
    grunt.registerTask('default', 'build');
    grunt.registerTask('compile', 'build', 'compile_build');

    grunt.registerTask('quick-build', [
        'clean', 'html2js', 'jshint', 'concat:css', 'concat:vendorcss',
        'copy:build_img', 'copy:build_fonts', 'copy:build_svgs', 'copy:build_data',
        'copy:build_vendor_assets', 'copy:build_vendorjs', 'copy:build_appjs',
        'index:build'
    ]);

    /**
     * The `build` task gets your app ready to run for development and testing.
     */
    grunt.registerTask('build', [
        'quick-build', 'karmaconfig', 'karma:continuous'
    ]);

    /**
     * The `compile` task gets your app ready for deployment by concatenating and
     * minifying your code.
     */
    grunt.registerTask('compile_build', [  'cssmin:own', 'cssmin:vendor',
        'copy:compile_assets', 'copy:compile_acevendorjs', 'copy:compile_index', 'ngAnnotate',
        'concat:compile_js', 'concat:compile_vendorjs',
        'uglify', 'index:compile'
    ]);

    /**
     * A utility function to get all app JavaScript sources.
     */
    function filterForJS(files) {
        return files.filter(function(file) {
            return file.match(/\.js$/);
        });
    }

    /**
     * A utility function to get all app CSS sources.
     */
    function filterForCSS(files) {
        return files.filter(function(file) {
            return file.match(/\.css$/);
        });
    }

    /**
     * The index.html template includes the stylesheet and javascript sources
     * based on dynamic names calculated in this Gruntfile. This task assembles
     * the list into variables for the template to use and then runs the
     * compilation.
     */
    grunt.registerMultiTask('index', 'Process index.html template', function() {
        var dirRE = new RegExp('^(' + grunt.config('build_dir') + '|' + grunt.config('compile_dir') + ')\/', 'g'),
            ngAppRE = new RegExp('^('+grunt.config('root_dir')+')\/', 'g');

        var jsFiles = filterForJS(this.filesSrc).map(function(file) {
            var aux = file.replace(dirRE, '');
            aux = aux.replace(ngAppRE, '');
            return aux;
        });
        var cssFiles = filterForCSS(this.filesSrc).map(function(file) {
            var aux = file.replace(dirRE, '');
            aux = aux.replace(ngAppRE, '');
            return aux;
        });
        var containerConfig = {
            version: grunt.config('pkg.version'),
            devel: grunt.task.current.target === 'build'
        };

        grunt.file.copy(this.data.root + '/index.html', this.data.dir + '/index.html', {
            process: function(contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles,
                        styles: cssFiles,
                        containerConfig: containerConfig
                    }
                });
            }
        });
    });

    /**
     * In order to avoid having to specify manually the files needed for karma to
     * run, we use grunt to manage the list for us. The `karma/*` files are
     * compiled as grunt templates for use by Karma. Yay!
     */
    grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function() {
        var jsFiles = filterForJS( this.filesSrc );

        grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
            process: function(contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        scripts: jsFiles
                    }
                });
            }
        });
    });

    grunt.registerTask('generateVersionTxt', 'Process version template', function() {
        var compile_dir = grunt.config.get('compile_dir');
        grunt.file.copy('resources/version.tpl.txt', compile_dir + '/version.txt', {
            process: function(contents, path) {
                return grunt.template.process(contents, {
                    data: {
                        pkg: grunt.config.get('pkg'),
                        env: process.env
                    }
                });
            }
        });
        grunt.file.copy(compile_dir + '/version.txt', grunt.config('dist_dir')+'/version.txt', {});
    });

};