module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: '<json:package.json>'

    coffee:
      # http:
      #   files:
      #     "web.js": "src/web.coffee"
      #   options:
      #     bare: true
      client:
        expand: true
        cwd: "client"
        src: ["**/*.coffee"]
        dest: "public/js"
        ext: ".js"
          
    watch:
      files: [
        'client/**/*.coffee'
      ]
      tasks: ['shell:browserify_sim_sim', 'shell:browserify_bumpercats']
    jasmine_node:
      options:
        forceExit: true
        match: '.'
        matchall: false
        extensions: 'coffee'
        specNameMatcher: 'spec'
        jUnit:
          report: true
          savePath : "./build/reports/jasmine/"
          useDotNotation: true
          consolidate: true
      all: ['spec/']

    shell:
      server:
        command: "foreman start"
        options:
          stdout: true

      jasmine:
        command: "node_modules/jasmine-node/bin/jasmine-node --coffee spec/"
        options:
          stdout: true
          failOnError: true

      jasmine_watch:
        # command: "node_modules/jasmine-node/bin/jasmine-node --autotest --watch . --noStack --coffee spec/"
        command: "node_modules/jasmine-node/bin/jasmine-node --autotest --watch . --coffee spec/"
        options:
          stdout: true

      browserify_clicker:
        command: "node_modules/.bin/browserify -t coffeeify client/clicker.coffee > public/js/clicker.js"
        options:
          failOnError: true
          stdout: true
      browserify_tanks2:
        command: "node_modules/.bin/browserify -t coffeeify client/tanks2.coffee > public/js/tanks2.js"
        options:
          failOnError: true
          stdout: true
      browserify_pixitest:
        command: "node_modules/.bin/browserify -t coffeeify client/pixitest.coffee > public/js/pixitest.js"
        options:
          failOnError: true
          stdout: true
      browserify_pixitest2:
        command: "node_modules/.bin/browserify -t coffeeify client/pixitest2.coffee > public/js/pixitest2.js"
        options:
          failOnError: true
          stdout: true
      browserify_sim_sim:
        command: "node_modules/.bin/browserify -t coffeeify client/sim_sim.coffee > public/js/sim_sim.js"
        options:
          failOnError: true
          stdout: true
      browserify_bumpercats:
        command: "node_modules/.bin/browserify -t coffeeify client/bumpercats.coffee > public/js/bumpercats.js"
        options:
          failOnError: true
          stdout: true

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-jasmine-node'
  grunt.loadNpmTasks 'grunt-shell'

  # grunt.registerTask 'default', ['coffee:client']
  
  grunt.registerTask 'spec', ['jasmine_node']

  grunt.registerTask 'server', 'shell:server'
  grunt.registerTask 'test', 'shell:jasmine'
  grunt.registerTask 'wtest', 'shell:jasmine_watch'

  grunt.registerTask 'bundle', ['shell:browserify_clicker', 'shell:browserify_tanks2', 'shell:browserify_pixitest', 'shell:browserify_pixitest2', 'shell:browserify_bumpercats' ]

    # uglify:
    #   options:
    #     banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    #   build:
    #     src: 'src/<%= pkg.name %>.js',
    #     dest: 'build/<%= pkg.name %>.min.js'

  # Load the plugin that provides the "uglify" task.
  #grunt.loadNpmTasks('grunt-contrib-uglify')

  # Default task(s).
  #grunt.registerTask('default', ['uglify'])

