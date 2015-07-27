#
# Modules
#

request = require('urllib-sync').request
path    = require('path')
fs      = require('fs')
marked  = require('marked')
_       = require('underscore')

#
# CONSTANTS
#

ERROR_CODE_RANGE_START = 400

App =
  failures: []

RegExplorer =
  link: /(https?:\/\/?)([\da-z\.-]+\.[a-z\.]{1,6}[\/\w\-].*?)"/

LinkCacher =
  links: []

LinkParser =
  linkMatches: []
  parse: (file, failed) ->
    process.stdout.write "."

    output = fs.readFileSync file.fullPath, 'utf-8'
    markdown = marked(output).split("\n")

    _.each markdown, (line) =>
      line = line.replace(/&amp;/g, '&')
      linkMatch = RegExplorer.link.exec(line)
      @linkMatches.push linkMatch[0].slice(0,-1) if linkMatch

    @validateLinks(file.fullPath)

  validateLinks: (file) ->
    _.each @linkMatches, (link) => @validateLink(link, file)
    failed = if App.failures.length then true else false
    @linkMatches = []
    failed

  validateLink: (link, file) ->
    if (_.indexOf LinkCacher.links, link) >= 0
      return console.log "Link #{link} (referenced in #{file}) already parsed; see response earlier in file"
    try
      res = request(link)
      status = res.status
      LinkCacher.links.push link
      @logError(link, null, status, file) if status >= ERROR_CODE_RANGE_START
    catch error
      errorMsg = error.stack.slice(0, 100)
      LinkCacher.links.push link
      @logError(link, errorMsg, null, file)

  logError: (link, status, errorMsg, file) ->
    extraMsg = if status then "response #{status}." else "error '#{errorMsg}'."
    console.log 'Build failed!'
    console.log "Reaching '#{link}' failed for the following reason: #{extraMsg}"
    console.log "Link referenced in '#{file}'\n"
    App.failures.push link

module.exports = LinkParser
