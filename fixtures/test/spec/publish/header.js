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
    "tags": ["header.js"],
    "name": "Header Tests",
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
    "tags": ["header.js"],
    "name": "Header Tests"
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

describe('Header', function(){
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

  it("Should check for Join ACS global link" , function(done) {

    browser.elementByCss('#my-menu > div > div:nth-child(1) > a')
      .text().should.eventually.equal('Join ACS')
      .notify(done);

  });

  it("Should check for Log In global link" , function(done) {

    browser.elementByCss('#my-menu > div > div:nth-child(2) > a')
      .text().should.eventually.equal('Log In')
      .notify(done);

  });


  it("Should check for ACS global link" , function(done) {

    browser.elementByCss('#global-links > ul > li:nth-child(1) > a > abbr')
      .text().should.eventually.equal('ACS')
      .notify(done);

  });

  it("Should check for Publications global link" , function(done) {

    browser.elementByCss('#global-links > ul > li:nth-child(2) > a')
      .text().should.eventually.equal('Publications')
      .notify(done);

  });

  it("Should check for C&EN global link" , function(done) {

    browser.elementByCss('#global-links > ul > li:nth-child(3) > a > abbr')
      .text().should.eventually.equal('C&EN')
      .notify(done);

  });

  it("Should check for CAS global link" , function(done) {

    browser.elementByCss('#global-links > ul > li:nth-child(4) > a > abbr')
      .text().should.eventually.equal('CAS')
      .notify(done);

  });

  it("Should check for Meetings link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(2) > a')
      .text().should.eventually.equal('MEETINGS')
      .notify(done);

  });

  it("Should check for Careers link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(3) > a')
      .text().should.eventually.equal('CAREERS')
      .notify(done);

  });

  it("Should check for Membership & Networks link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(4) > a')
      .text().should.eventually.equal('MEMBERSHIP & NETWORKS')
      .notify(done);

  });

  it("Should check for Education link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(5) > a')
      .text().should.eventually.equal('EDUCATION')
      .notify(done);

  });

  it("Should check for Funding & Awards link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(6) > a')
      .text().should.eventually.equal('FUNDING & AWARDS')
      .notify(done);

  });

  it("Should check for Press Room link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(7) > a')
      .text().should.eventually.equal('PRESS ROOM')
      .notify(done);

  });

  it("Should check for Advocacy link" , function(done) {

    browser.elementByCss('.container > ul > li:nth-child(8) > a')
      .text().should.eventually.equal('ADVOCACY')
      .notify(done);

  });

});