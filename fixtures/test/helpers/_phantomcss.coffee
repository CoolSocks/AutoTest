#bootstraps phantomcss for us
modules = '../node_modules'
phantomcss = require('../../node_modules/phantomcss/phantomcss')
phantomcss.init {
  libraryRoot: '../..'
  screenshotRoot : '../../target/screenshots'
  failedComparisonsRoot : '../../target/screenshots/failures'
}

exports = module.exports = phantomcss