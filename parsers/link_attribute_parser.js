const fs = require('fs'),
  path = require('path'),
  marked = require('marked'),
  colors = require('colors'),
  _ = require('lodash'),

  App = {
    failures: []
  },

  RegExplorer = {
    attributes: /(\[[^\[]+\]\(.*\.md\s.+?\))/i
  },

  LinkAttributeParser = {
    imagePaths: [],
    markdownPaths: [],
    currentPath: '',
    Attributes: [],
    parse: function(file, failed) {
      let markdown, output;
      App.failures = [];
      this.printWorkingIndicator();
      this.currentPath = file.fullParentDir;
      output = fs.readFileSync(file.fullPath, 'utf-8');
      markdown = output.split("\n");
      _.each(markdown, function(line) {
        const attributeMatches = RegExplorer.attributes.exec(line);
        if (attributeMatches) {
          console.log(("\nInvalid markdown link '" + attributeMatches[0] + "', titles are not supported. (Referenced from '" + file.fullPath + "')").red);
          failed = true;
        }
      });
      return failed;
    },
    printWorkingIndicator: function() {
      return process.stdout.write(".");
    }
  };

module.exports = LinkAttributeParser;
