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

describe('ACS Home Page', function(){
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

  describe('Body', function(){

    /*
    it("should display Chemistry News", function (done) {

      browser.elementByCss('')
      .text().should.eventually.equal("Molecule of the Week")
      .notify(done);

    });

    it("should display the molecule of the week", function (done) {

      browser.elementByCss('#bd > div.row-fluid > div > div > div:nth-child(3) > div > div.span4.center-block > div > div:nth-child(2) > div > div > div > div > div:nth-child(1) > div > h3')
      .text().should.eventually.equal("Molecule of the Week")
      .notify(done);
    });
    */
  });

  describe('Carousel', function(){
    var width1 = 730;
    var height1 = 350;

    it("Should display the carousel", function (done) {  
      
      browser.elementByCss('#carousel4up').displayed().should.eventually.equal(true)
        .notify(done);
    
    });

    it("Carousel image 1 has correct image height", function (done) {

      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(1)').displayed().should.eventually.equal(true);
      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(1)').getSize()
        .then(function (fulfilled) {
          var heightval = fulfilled.height;

          if(fulfilled.height === height1) {
            done();         
          }
          else {
            done("Height was "+ heightval +" instead of " + height1);
          }
     
          },function (notfulfilled){

            done("promise did not deliver value");
      });

    });

    it("Carousel image 2 has correct image height", function (done) {

      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(2)').displayed().should.eventually.equal(true);
      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(2)').getSize()
        .then(function (fulfilled) {
          var heightval = fulfilled.height;

          if(fulfilled.height === height1) {
            done();         
          }
          else {
            done("Height was "+ heightval +" instead of " + height1);
          }
     
          },function (notfulfilled){

            done("promise did not deliver value");
      });

    });

    it("Carousel image 3 has correct image height", function (done) {

      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(3)').displayed().should.eventually.equal(true);
      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(3)').getSize()
        .then(function (fulfilled) {
          var heightval = fulfilled.height;

          if(fulfilled.height === height1) {
            done();         
          }
          else {
            done("Height was " + heightval + " instead of " + height1);
          }
     
          },function (notfulfilled){
            done("promise did not deliver value");
      });

    });

    it("Carousel image 4 has correct image height", function (done) {

      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(4)').displayed().should.eventually.equal(true);
      browser.elementByCss('#carousel4up > .owl-carousel > .owl-stage-outer > div > .owl-item:nth-child(4)').getSize()
        .then(function (fulfilled) {
          var heightval = fulfilled.height;

          if(fulfilled.height === height1) {
            done();         
          }
          else {
            done("Height was "+ heightval +" instead of " + height1);
          }
     
          },function (notfulfilled){

            done("promise did not deliver value");
      });

    });

  });

  describe('Breadcrumb', function(){

    it("Should verify the breadcrumb" , function(done) {

        browser.elementByCss('.breadcrumb > ul > li:nth-child(2)')
          .text().should.eventually.equal('American Chemical Society')
          .notify(done);

    });

  });

});