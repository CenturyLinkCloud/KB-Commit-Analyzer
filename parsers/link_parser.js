function logError(link, status, errorMsg, file) {
  const extraMsg = status ? "response " + status + "." : "error '" + errorMsg + "'.";
  console.log('Build failed!');
  console.log("Reaching '" + link + "' failed for the following reason: " + extraMsg);
  console.log("Link referenced in '" + file + "'\n");
  return App.failures.push(link);
}

function validateLink(link, file) {
  let error, res, status;
  try {
    res = request(link);
    status = res.status;
    if (status >= ERROR_CODE_RANGE_START) {
      logError(link, null, status, file);
    }
  } catch (error1) {
    error = error1;
    logError(link, error.stack.slice(0, 100), null, file);
  }
}

const request = require('urllib-sync').request,
  path = require('path'),
  fs = require('fs'),
  marked = require('marked'),
  _ = require('lodash'),

  ERROR_CODE_RANGE_START = 400,

  App = {
    failures: []
  },

  RegExplorer = {
    link: /(https?:\/\/?)([\da-z\.-]+\.[a-z\.]{2,6}[\/\w\-].*?)"/
  },

  LinkParser = {
    linkMatches: [],
    parse: function(file, failed) {
      let output, markdown;
      console.log("Parsing links...\n\n\n");
      output = fs.readFileSync(file.fullPath, 'utf-8');
      markdown = marked(output).split("\n");
      _.each(markdown, function(line) {
        line = line.replace(/&amp;/g, '&');
        const linkMatch = RegExplorer.link.exec(line);
        if (linkMatch) {
          LinkParser.linkMatches.push(linkMatch[0].slice(0, -1));
        }
      });
      return this.validateLinks(file.fullPath);
    },
    validateLinks: function(file) {
      _.each(this.linkMatches, function(link) {
        return validateLink(link, file);
      });
      return App.failures.length ? true : false;
    }
  };

module.exports = LinkParser;
