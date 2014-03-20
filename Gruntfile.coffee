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
        'Gruntfile.coffee'
        'client/**/*.coffee'
      ]
      tasks: 'coffee:client'

    shell:
      server:
        command: "foreman start"
        options:
          stdout: true

      jasmine:
        command: "node_modules/jasmine-node/bin/jasmine-node --noStack --coffee spec/"
        options:
          stdout: true
          failOnError: true

      jasmine_watch:
        command: "node_modules/jasmine-node/bin/jasmine-node --autotest --watch . --noStack --coffee spec/"
        options:
          stdout: true

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  # grunt.loadNpmTasks 'grunt-jasmine-node'
  grunt.loadNpmTasks 'grunt-shell'

  grunt.registerTask 'default', ['coffee:client']
  
  grunt.registerTask 'server', 'shell:server'
  grunt.registerTask 'test', 'shell:jasmine'
  grunt.registerTask 'wtest', 'shell:jasmine_watch'

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

