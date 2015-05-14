/* jshint evil: true */
var config = require('./testconfig.js');
var colors = require('colors');
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd;
try {
  wd = require('wd');
} catch( err ) {
  wd = require('../../lib/main');
}

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

var saucelabsUsed = config.sauce1;
var browserToUse = config.browser1;
var browser;
var desired;
var sauceid = config.sauceid1;
var portnum = config.portnum1;

if(saucelabsUsed === true){
  //for saucelabs
 // bin/sc -u wsoux -k be3861cf-8f17-45c3-ad73-f3064db886cb
    browser = wd.promiseChainRemote({
    "hostname": 'ondemand.saucelabs.com',
    "port": portnum,
    "user": 'wsoux',
    "pwd": 'be3861cf-8f17-45c3-ad73-f3064db886cb'
    });

  desired = {
    "browserName": browserToUse,
    "version": config.version1,
    "platform": config.platform1,
    "tags": ["education.js"],
    "name": "education tests",
    "tunnel-identifier":sauceid
  };
}
else{
// Run Local
//var url = require('url');
  browser = wd.promiseChainRemote(
//url.parse('http://localhost:4444/wd/hub') //or put this in remote
    {

      //these are all default and aren't needed
    protocol: 'http:',
    hostname: 'localhost',
    port: 4444,
    path: '/wd/hub'

  }
  );
  desired = {
    browserName: browserToUse
    , tags: ["education.js"]
    , name: "education test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitGameTimeout = 5000;//game to load
var waitFlyoutTimeout = 2500;

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitGameTimeout = 5000;
  waitFlyoutTimeout = 2500;

}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitGameTimeout = 5000;
  waitFlyoutTimeout = 2500;

}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
  waitGameTimeout =5000;
  waitFlyoutTimeout = 2500;
}

//etc add as needed

describe('education', function(){

  this.timeout(60000);

  before( function (done) {
    browser.init(desired).fin(function(){

        done();
      })
  });

  after(function (done) {
    browser.quit();
    setTimeout(done, 500);
  });

  it("should have an appropriate title tag and URL", function (done) {//also maximize window to prevent possible issues
    browser.maximize()
    .get(domain + "/content/acs/en.html");

    setTimeout(delay,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay(){
      browser.eval('window.location.href')
      .should.eventually.include('/content/acs/en.html')
      .title()
      .should.become('American Chemical Society')
      .notify(done);
    }
  });

  describe('education -> adventures in Chemistry',function() {

    it('verifies Experiments link', function (done) {

      browser.elementByCss('#education > a').click();

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.elementByCss('#bd > div > div.span9 > div > div.columnsBootstrap.parbase.section > div > div:nth-child(1) > div > div > div > div > div:nth-child(3) > div > ul > li:nth-child(1) > a')
        .click();//adventures in chemistry

        setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay2(){

          browser.elementByCss('#nav > ul > li:nth-child(2) > a').click();//experiments

          setTimeout(delay3,waitPageTimeout);//sometimes doesnt switch fast enough
          function delay3(){

            browser.eval('window.location.href').should.eventually.include('/content/acs/en/education/whatischemistry/adventures-in-chemistry/experiments.html')
            .elementByCss('#wrapper > div.parbase.acsBreadcrumb.breadcrumbNav > div > ul > li.breadcrumb-item-6.currentCrumb')
            .text().should.eventually.equal('Experiments')
            .notify(done);
          }
        }
      }
    });

    it('verifies home link', function (done) {

      browser.elementByCss('#nav > ul > li:nth-child(1) > a').click();//home

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.eval('window.location.href').should.eventually.include('/content/acs/en/education/whatischemistry/adventures-in-chemistry.html')
        .elementByCss('#wrapper > div.parbase.acsBreadcrumb.breadcrumbNav > div > ul > li.breadcrumb-item-5.currentCrumb')
        .text().should.eventually.equal('Adventures in Chemistry')
        .notify(done);
      }
    });
    
    it('verifies secret science of stuff link', function (done) {

      browser.elementByCss('#nav > ul > li:nth-child(3) > a').click();//secret science of stuff

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.eval('window.location.href').should.eventually.include('/content/acs/en/education/whatischemistry/adventures-in-chemistry/secret-science-of-stuff.html')
        .elementByCss('#wrapper > div.parbase.acsBreadcrumb.breadcrumbNav > div > ul > li.breadcrumb-item-6.currentCrumb')
        .text().should.eventually.equal('Secret Science of Stuff')
        .notify(done);
      }
    });

    it('verifies Science ABCs link', function (done) {

      browser.elementByCss('#nav > ul > li:nth-child(5) > a').click();//scienceabcs

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.eval('window.location.href').should.eventually.include('/content/acs/en/education/whatischemistry/adventures-in-chemistry/science-abcs.html')
        .elementByCss('#wrapper > div.parbase.acsBreadcrumb.breadcrumbNav > div > ul > li.breadcrumb-item-6.currentCrumb')
        .text().should.eventually.equal('Science ABCs')
        .notify(done);
      }
    });

    it('verifies games link', function (done) {

      browser.elementByCss('#nav > ul > li:nth-child(4) > a').click();//games

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.eval('window.location.href').should.eventually.include('/content/acs/en/education/whatischemistry/adventures-in-chemistry/games.html')
        .elementByCss('#wrapper > div.parbase.acsBreadcrumb.breadcrumbNav > div > ul > li.breadcrumb-item-6.currentCrumb')
        .text().should.eventually.equal('Games')
        .notify(done);
      }
    });

    it("should have a copyright that matches the current year", function (done) {//for education (different than regular footer)
    
      browser.elementByCss('#footer > div > p').text()
      .should.eventually.equal('Copyright © '+ (new Date).getFullYear() +' American Chemical Society')
      .notify(done);
    });
    
    it("should test the game", function (done) {//work in progress

      browser.elementByCss('#main > div.parsys.mediaContent > div > section > div > div > div > div > div > div > a > img')
      .click();//the game
      
      setTimeout(delay1,waitGameTimeout);//game needs to load       
      function delay1(){

        browser.windowHandles()

        .then(function (handles) {//switch to the game window
        
          browser.window(handles[1]);

          setTimeout(delay2,waitFlyoutTimeout);//sometimes doesnt switch fast enough
          function delay2(){

            browser.title().should.become("Bugs on the Run - American Chemical Society")
            .elementByCss('#game').displayed().should.eventually.equal(true)
            .notify(done)
          }

        },function (notfulfilled){

          done("promise did not deliver value");
        });
      }
    });
    
    it("should open the homepage.", function (done) {
      browser.get(domain + "/content/acs/en.html").fin(function(){
      done();
      });
    });    
  });

});