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
    "tags": ["footer.js"],
    "name": "Footer Tests",
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
    "tags": ["footer.js"],
    "name": "Footer Tests"
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

describe('Footer', function(){
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

  it("Should check for the Renew Membership link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(1) > div > dl > dd:nth-child(2) > a')
      .text().should.eventually.equal('Renew Membership')
      .notify(done);

  });

  it("Should check for the Change Contact Info link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(1) > div > dl > dd:nth-child(3) > a')
      .text().should.eventually.equal('Change Contact Info')
      .notify(done);

  });

  it("Should check for the Volunteer link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(1) > div > dl > dd:nth-child(4) > a')
      .text().should.eventually.equal('Volunteer')
      .notify(done);

  });

  it("Should check for the Donate link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(1) > div > dl > dd:nth-child(5) > a')
      .text().should.eventually.equal('Donate')
      .notify(done);

  });

  /*
  it("Should check for the Insurance link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(2) > div > dl > dd:nth-child(2) > a')
      .text().should.eventually.equal('Insurance')
      .notify(done);

  });
  */

  /*
  it("Should check for the Career Services link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(2) > div > dl > dd:nth-child(3) > a')
      .text().should.eventually.equal('Career Services')
      .notify(done);

  });
  */

  it("Should check for the Webinars link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(2) > div > dl > dd:nth-child(4) > a')
      .text().should.eventually.equal('Webinars')
      .notify(done);

  });

  it("Should check for the Member Discounts link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(2) > div > dl > dd:nth-child(5) > a')
      .text().should.eventually.equal('Member Discounts')
      .notify(done);

  });

  it("Should check for the ACS Network link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(3) > div > dl > dd:nth-child(2) > a')
      .text().should.eventually.equal('ACS Network')
      .notify(done);

  });

  /*
  it("Should check for the Local Sections link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(3) > div > dl > dd:nth-child(3) > a')
      .text().should.eventually.equal('Local Sections')
      .notify(done);

  });
  */

  /*
  it("Should check for the Technical Divisions link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(3) > div > dl > dd:nth-child(4) > a')
      .text().should.eventually.equal('Technical Divisions')
      .notify(done);

  });
  */

  it("Should check for the AACT link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(3) > div > dl > dd:nth-child(5) > a')
      .text().should.eventually.equal('American Association of Chemistry Teachers')
      .notify(done);

  });

  it("Should check for the International Center link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(2) > a')
      .text().should.eventually.equal('International Center')
      .notify(done);

  });

  it("Should check for the Green Chemistry link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(3) > a')
      .text().should.eventually.equal('Green Chemistry')
      .notify(done);

  });

  it("Should check for the Sustainability link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(4) > a')
      .text().should.eventually.equal('Sustainability')
      .notify(done);

  });

  it("Should check for the Periodic Table of Elements link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(5) > a')
      .text().should.eventually.equal('Periodic Table of Elements')
      .notify(done);

  });

  it("Should check for the Chemistry Olympiad link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(6) > a')
      .text().should.eventually.equal('Chemistry Olympiad')
      .notify(done);

  });

  it("Should check for the Educational Resources link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(4) > div > dl > dd:nth-child(7) > a')
      .text().should.eventually.equal('Educational Resources')
      .notify(done);

  });

  it("Should check for the About ACS link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(5) > div > dl > dd:nth-child(2) > a')
      .text().should.eventually.equal('About ACS')
      .notify(done);

  });

  it("Should check for the Governance link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(5) > div > dl > dd:nth-child(3) > a')
      .text().should.eventually.equal('Governance')
      .notify(done);

  });

  it("Should check for the Store link" , function(done) {

    browser.elementByCss('#ft-sitemap > div:nth-child(5) > div > dl > dd:nth-child(4) > a')
      .text().should.eventually.equal('Store')
      .notify(done);

  });

  it("Should check for the Top ^ link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(1) > a')
      .text().should.eventually.equal('Top ^')
      .notify(done);

  });

  it("Should check for the Terms of Use link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(2) > a')
      .text().should.eventually.equal('Terms of Use')
      .notify(done);

  });

  it("Should check for the Security link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(3) > a')
      .text().should.eventually.equal('Security')
      .notify(done);

  });

  it("Should check for the Privacy link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(4) > a')
      .text().should.eventually.equal('Privacy')
      .notify(done);

  });

  it("Should check for the Site Map link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(5) > a')
      .text().should.eventually.equal('Site Map')
      .notify(done);

  });

  it("Should check for the Contact link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(6) > a')
      .text().should.eventually.equal('Contact')
      .notify(done);

  });

  it("Should check for the Help link" , function(done) {

    browser.elementByCss('.ft-links > ul > li:nth-child(7) > a')
      .text().should.eventually.equal('Help')
      .notify(done);

  });

  it("should have a copyright that matches the current year", function (done) {

    browser.elementByCss('.ft-links > p')
      .text()
      .should.eventually.equal('Copyright © '+ (new Date).getFullYear() +' American Chemical Society')
      .notify(done);

  });
});