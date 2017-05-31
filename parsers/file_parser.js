function printErrorAndReturnFailure(file, refFile) {
  console.log(("\nFile '" + file + "' not found. Is there a file extension? Are the file extension and path correct? (Referenced from '" + refFile + "')").red);
  return App.failures.push(file);
}

function checkFiles(files, curPath, refFile) {
  return _.each(files, function(file) {
    let err, fd, resolvedPath;
    resolvedPath = path.resolve(curPath, file);
    try {
      fd = fs.openSync(resolvedPath, 'r');
      return fs.closeSync(fd);
    } catch (error) {
      err = error;
      return printErrorAndReturnFailure(resolvedPath, refFile);
    }
  });
}

function printWorkingIndicator() {
  return process.stdout.write(".");
}

const fs = require('fs'),
  path = require('path'),
  marked = require('marked'),
  colors = require('colors'),
  _ = require('lodash'),

  App = {
    failures: []
  },

  RegExplorer = {
    filePath: /(href|src)="(?!\?|http|mailto|ftp|sftp|git|smtp|file)(?!\/\/)((?!#)(.*?)((#.*?)?)("))/
  },

  FileParser = {
    imagePaths: [],
    markdownPaths: [],
    currentPath: '',
    files: [],
    parse: function(file, failed) {
      let markdown, output;
      App.failures = [];
      printWorkingIndicator();
      this.currentPath = file.fullParentDir;
      output = fs.readFileSync(file.fullPath, 'utf-8');
      markdown = marked(output).split("\n");
      _.each(markdown, function(line) {
        var filePathMatch;
        line = line.replace(/&amp;/g, '&');
        filePathMatch = RegExplorer.filePath.exec(line);
        if (filePathMatch) {
          FileParser.files.push(filePathMatch[3]);
        }
      });
      checkFiles(this.files, this.currentPath, file.fullPath);
      if (App.failures.length) {
        failed = true;
      }
      this.files = [];
      return failed;
    }
  };

module.exports = FileParser;
