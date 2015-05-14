phantomcss = require('../helpers/_phantomcss')

casper.start "http://www.acs.org/content/acs/en.html"
casper.viewport 1024,768

casper.then ->
  phantomcss.screenshot('#searchsite', "search-bar");

casper.then ->
  casper.click "#searchsite"
  phantomcss.screenshot('#searchsite', "search-bar-after-click")

casper.then ->
  casper.viewport 320,240
  phantomcss.screenshot "body" ,"body"

casper.then ->
  phantomcss.compareAll()

casper.run ->
  @echo "done"
  phantom.exit phantomcss.getExitStatus()