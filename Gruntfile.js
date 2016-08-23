module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    srcPath: 'src',
    distPath: 'dist',
    specs: 'test/**/*.js',
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'+
        '\'use strict\';\n'+
        '(function (factory, window) {\n'+
        '   /*globals define, module, require*/\n'+
        '   // define an AMD module that relies on \'leaflet\'\n'+
        '   if (typeof define === \'function\' && define.amd) {\n'+
        '       define([\'leaflet\'], factory);\n'+
        '   // define a Common JS module that relies on \'leaflet\'\n'+
        '   } else if (typeof exports === \'object\') {\n'+
        '       module.exports = factory(require(\'leaflet\'));\n'+
        '   }\n'+
        '   // attach your plugin to the global \'L\' variable\n'+
        '   if(typeof window !== \'undefined\' && window.L){\n'+
        '       factory(window.L);\n'+
        '   }\n'+
        '}(function (L) {\n',
        footer: '}, window));'
      },
      main: {
        src: [
          '<%= srcPath %>/Leaflet.Editable.js',
          '<%= srcPath %>/Leaflet.Editable.startLayers.js',
          '<%= srcPath %>/Leaflet.Editable.createLayers.js',
          '<%= srcPath %>/L.Map.js',
          '<%= srcPath %>/L.Editable.VertexIcon.js',
          '<%= srcPath %>/L.Editable.TouchVertexIcon.js',
          '<%= srcPath %>/L.Editable.VertexMarker.js',
          '<%= srcPath %>/L.Editable.MiddleMarker.js',
          '<%= srcPath %>/L.Editable.BaseEditor.js',
          '<%= srcPath %>/L.Editable.MarkerEditor.js',
          '<%= srcPath %>/L.Editable.PathEditor.js',
          '<%= srcPath %>/L.Editable.PolylineEditor.js',
          '<%= srcPath %>/L.Editable.PolygonEditor.js',
          '<%= srcPath %>/L.Editable.RectangleEditor.js',
          '<%= srcPath %>/L.Editable.CircleEditor.js',
          '<%= srcPath %>/EditableMixin.js',
          '<%= srcPath %>/L.Polyline.js',
          '<%= srcPath %>/L.Polygone.js',
          '<%= srcPath %>/L.Marker.js',
          '<%= srcPath %>/L.Rectangle.js',
          '<%= srcPath %>/L.Circle.js',
          '<%= srcPath %>/keepEditable.js',
          '<%= srcPath %>/L.LatLng.js'
        ],
        dest: '<%= distPath %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      main: {
        src: '<%= concat.main.dest %>',
        dest: '<%= distPath %>/<%= pkg.name %>.min.js'
      }
    },
    eslint: {
      scripts: {
        src: ['<%= concat.main.src %>']
      },
      specs: {
        src: ['<%= specs %>/**/*.js']
      }
    },

    watch: {
      scripts: {
        files: '<%= concat.main.src %>',
        tasks: ['concat', 'uglify', 'eslint:scripts']
      },
      specs: {
        files: ['<%= specs %>'],
        tasks: ['eslint:specs']
      }
    }
  });

  grunt.util.linefeed = '\n';
  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks("gruntify-eslint");

  // Default grunt task.
  grunt.registerTask('default', [
    'eslint:scripts',
    'eslint:specs',
    'concat',
    'uglify'
  ]);

  // CI build task
  grunt.registerTask('build', ['concat', 'uglify', 'eslint:scripts']);
};
