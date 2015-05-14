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
    "tags": ["Governance.js"],
    "name": "governance tests",
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
    , tags: ["Governance.js"]
    , name: "governance test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitFlyoutTimeout = 3000;//and lightbox, window resize, search as you type


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
  waitFlyoutTimeout =3000;

}

//etc add as needed

describe('Governance', function(){

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

  describe('Governance page', function(){

    it("have flyout and its links functioning'", function (done) {

      browser.elementByCss('#support-nav > ul > li:nth-child(3) > a').click();//go to governance page

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

      browser.elementByCss('#bd > div.row-fluid > div.span3.transition-nav > div > div > ul > li.selected > ul > li:nth-child(4) >  a')
      .moveTo();//move mouse over bylaws menu

        setTimeout(delay2,waitFlyoutTimeout);//needs to wait for flyout to appear (may need to adjust for different browsers)
        function delay2(){

          browser.elementByCss('#bd > div.row-fluid > div.span3.transition-nav > div > div > ul > li.selected > ul > li:nth-child(4) > ul > li.even > a')
          .displayed().should.eventually.equal(true)//assert flyout

          .elementByCss('#bd > div.row-fluid > div.span3.transition-nav > div > div > ul > li.selected > ul > li:nth-child(4) > ul > li.even > a')
          .click();//click technical

          setTimeout(delay3,waitPageTimeout);//sometimes doesnt switch fast enough
          function delay3(){

            browser.eval('window.location.href')
            .should.eventually.include('/content/acs/en/about/governance/charter/tdbylaws.html')//confirm link
            .notify(done);
          }
        }
      }   
    });

    it("should test responsiveness", function (done) {

      browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.parsys.articleContent > div.parbase.table.section > table')
      .displayed().should.eventually.equal(true)//table element
      browser.setWindowSize(480, 854);//tests responsiveness of table

      setTimeout(delay1,waitFlyoutTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.parsys.articleContent > div.parbase.table.section > div > div.pinned > table')
        .displayed().should.eventually.equal(true)//table gets split and checks for one of them       
        .notify(done);
      }
    });

    it("should maximize page", function (done) {
      browser.maximize()
      done();
    });

    it("should open the homepage.", function (done) {
      browser.get(domain + "/content/acs/en.html").fin(function(){
      done();
      });
    });
  });

});