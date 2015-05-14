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
    "tags": ["searchbar.js"],
    "name": "Search Bar Tests",
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
    "tags": ["searchbar.js"],
    "name": "Search Bar Tests"
  };
}

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitFlyoutTimeout = 3000

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitFlyoutTimeout = 2500;
}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitFlyoutTimeout = 3000;
}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
  waitFlyoutTimeout = 3000;
}

chai.use(chaiAsPromised);
chai.should();

describe('Search Bar', function(){
  this.timeout(60000);

  before(function (done) {
    browser
      .init(desired)
      .maximize()
      .get(config.domain + '/content/acs/en.html')
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

  it('Should search and produce results correctly and have search as you type', function (done) {

    browser.elementByCss('#search > .acsSearch > form > input#searchsite').type('Green Che');//searchbar

    setTimeout(delay1,waitFlyoutTimeout);//sometimes doesn't appear fast enough

    function delay1(){

      browser.elementByCss('#search > div > form > input.search-submit').click();//click second option

      setTimeout(delay2,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay2(){

        browser.elementByCss('.main-results-without-dn').displayed().should.eventually.equal(true)//Search Results header
        .notify(done);
      }
    }

  });

  it("Should open the homepage.", function (done) {
    browser.get(config.domain + "/content/acs/en.html").fin(function() {
      done();
    });
  });     

});