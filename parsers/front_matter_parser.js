const frontMatter = require('json-front-matter'),
  path = require('path'),
  fs = require('fs'),
  colors = require('colors'),
  _ = require('lodash'),

  App = {
    failures: []
  },

  FrontMatterParser = {
    requiredAttrs: ['title', 'date', 'author'],
    ignoredFileNames: ['README.md', 'index.md'],
    fileIsIgnored: function(fileName) {
      if (this.ignoredFileNames.indexOf(fileName) >= 0) {
        return true;
      } else {
        return false;
      }
    },
    parse: function(file, failed) {
      let attrDiff, err, fileAttrs, fileText, missingAttr, output;
      process.stdout.write(".");
      if (this.fileIsIgnored(file.name)) {
        return;
      }
      fileText = fs.readFileSync(file.fullPath, 'utf-8');
      try {
        frontMatter.parse(fileText);
      } catch (error) {
        err = error;
        console.log(err.stack.slice(0, 250));
        console.log("This occurred in " + file.fullPath);
        failed = true;
        return failed;
      }
      output = frontMatter.parse(fileText);
      fileAttrs = _.keys(output.attributes);
      attrDiff = _.difference(this.requiredAttrs, fileAttrs);
      missingAttr = _.intersection(attrDiff, this.requiredAttrs);
      if (missingAttr.length) {
        console.log(("\nFile '" + file.fullPath + "' did not contain required attributes in the front-matter.").red);
        console.log(("Required attributres are " + (this.requiredAttrs.join(', ')) + ". File was missing a value for the following attibute(s): " + (missingAttr.join(', ')) + ".\n").red);
        App.failures.push(file.fullPath);
      }
      if (App.failures.length) {
        failed = true;
      }
      return failed;
    }
  };

module.exports = FrontMatterParser;
