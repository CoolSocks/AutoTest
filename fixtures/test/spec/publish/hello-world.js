/* jshint evil: true */
var config = require("./testconfig.js");

var colors = require("colors");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var sauceid = config.sauceid1;
var portnumber = config.portnum1;
var wd;
var browser;
var desired;

try {
  wd = require("wd");
}
catch( err ) {
  wd = require("../../lib/main");
}

chai.use(chaiAsPromised);
chai.should();

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var saucelabsUsed = config.sauce1;
var browserToUse = config.browser1;

if(saucelabsUsed === true){
  // for saucelabs
  // bin/sc -u wsoux -k be3861cf-8f17-45c3-ad73-f3064db886cb
  browser = wd.promiseChainRemote({
    "hostname": 'ondemand.saucelabs.com',
    "port": 80,
    "user": 'wsoux',
    "pwd": 'be3861cf-8f17-45c3-ad73-f3064db886cb'
  });

  desired = {
    "browserName": browserToUse,
    "version": config.version1,
    "platform": config.platform1,
    "tags": ["hello-world.js"],
    "name": "Hello World",
    "tunnel-identifier": sauceid
  };
}
else{
  // Run Local
  // var url = require('url');
  browser = wd.promiseChainRemote(
  //url.parse('http://localhost:4444/wd/hub') //or put this in remote
  {
    //these are all default and aren't needed
    protocol: 'http:',
    hostname: 'localhost',//or 127.0.0.1
    port: portnumber,
    path: '/wd/hub',
  });
  desired = {
    "browserName": browserToUse,
    "tags": ["hello-world.js"],
    "name": "Hello World"
  };
}

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
}

chai.use(chaiAsPromised);
chai.should();

describe('Hello World', function(){
  this.timeout(60000);

  before(function (done) {
    browser
      .init(desired)
      .maximize()
      .get(config.bamboodomain + '/content/acs/en.html')
      .fin(function(){
        done();
      });
  });

  beforeEach(function(done) {
    browser
      .eval('window.location.href', function(err, href) {
        if(href.indexOf('/libs/granite/core/content/login.html') > -1) {
          browser
            .elementById('username').type(config.username)
            .elementById('password').type(config.password)
            .elementByCss('button.primary').click()
            .fin(function(){});
        }
      })
      .fin(function() {
        done();
      });
  });

  after(function (done) {
    browser.quit();
    setTimeout(done, 500);
  });

  it("should have an appropriate title tag and URL", function (done) {
    setTimeout(delay,waitPageTimeout);

    function delay(){
      browser.eval('window.location.href')
      .should.eventually.include('/content/acs/en.html')
      .title()
      .should.become('American Chemical Society')
      .notify(done);
    }
  });

  it("Should have Protected Content modal dialog box", function (done) {
    setTimeout(delay,waitPageTimeout);

    function delay(){
      browser.get(config.bamboodomain + '/content/acs/en/cute-puppies/protected-page.html')
      .elementById('protectContentLightBox')
      .should.not.be.ok
      .notify(done);
    }
  });

});
