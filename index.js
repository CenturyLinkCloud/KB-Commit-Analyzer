const readdirp = require('readdirp'),
  path = require('path'),
  fs = require('graceful-fs'),
  _ = require('lodash'),
  frontMatterParser = require('./parsers/front_matter_parser'),
  markdownParser = require('./parsers/markdown_parser'),
  fileParser = require('./parsers/file_parser'),
  linkParser = require('./parsers/link_parser'),
  linkAttributeParser = require('./parsers/link_attribute_parser'),
  parsers = [
    frontMatterParser,
    markdownParser,
    fileParser,
    linkAttributeParser
  ],
  directoryFilters = ['!node_modules', '!lib', '!Archive'],
  fileFilters = '*.md',
  F = {
    failed: null
  },
  Ignored = {
    files: []
  };

function loadIgnored() {
  let err, files;
  try {
    files = fs.readFileSync('../commit_analyzer_ignore.txt', 'utf-8');
    files = files.split('\n');
    console.log("\n\nIgnoring " + (files.join(', ')));
    return _.each(files, function(file) {
      return Ignored.files.push(file);
    });
  } catch (error) {
    err = error;
    return console.log("\n\nunable to find commit_analyzer_ignore.txt file; not ignoring any files...\n\n");
  }
}

function readOpts() {
  return {
    root: path.join(__dirname, '..'),
    fileFilter: fileFilters,
    directoryFilter: directoryFilters
  };
}

function fileIsIgnored(file) {
  return _.indexOf(Ignored.files, file) >= 0;
}

function analyze() {
  loadIgnored();
  return readdirp(
    readOpts(),
    function(file) {
      if (fileIsIgnored(file.name)) {
        return;
      }
      return _.each(parsers, function(parser) {
        const failed = F.failed;
        return F.failed = parser.parse(file, failed);
      });
    },
    function(err, res) {
      if (F.failed) {
        return process.exit(1);
      } else {
        return process.exit(0);
      }
    }
  );
}

analyze();
