const fs = require('fs'),
  marked = require('marked'),
  colors = require('colors'),
  _ = require('lodash'),

  App = {
    failures: []
  },

  MarkdownParser = {
    parse: function(file, failed) {
      process.stdout.write(".");
      fs.readFile(file.fullPath, 'utf-8', function(err, data) {
        let error;
        try {
          return marked(data);
        } catch (error1) {
          error = error1;
          console.log(error);
          console.log("\nFile '" + file.fullPath + "' failed markdown parsing.\n");
          return App.failures.push(file.fullPath);
        }
      });
      if (App.failures.length) {
        failed = true;
      }
      return failed;
    }
  };

module.exports = MarkdownParser;
