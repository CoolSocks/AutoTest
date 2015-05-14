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
    "tags": ["subscribe.js"],
    "name": "subscribe tests",
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
    , tags: ["subscribe.js"]
    , name: "subscribe test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitFlyoutTimeout = 2500;
var waitLogout = 5000;

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;

  waitFlyoutTimeout = 2500;

}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;

  waitFlyoutTimeout = 2500;

}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;

  waitFlyoutTimeout = 2500;
}

//etc add as needed

describe('subscribe', function(){

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

  it("should make sure subscribing to the national newsletter works", function (done){

    browser.elementByCss('#meetings > a').click();//meetings link

    setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay1(){

      //click on national newsletter
      browser.elementByCss('.subscribe-btn-container.center.cq-cc-subscribe-anonymous.cq-cc-subscribe-not-anonymous').click();

      setTimeout(delay2,waitFlyoutTimeout);//sometimes doesn't load quite fast enough
      function delay2(){

        browser.frame(0)//switch to iframe
          .elementByCss('#userid').type('acstest_g')//username
          .elementByCss('#password').type('password')//password
          .elementByCss('#bd .action > input').click()//login button
          .elementByCss('body > h3').text().should.eventually.equal('Thank you for subscribing.')//header should now display this
        .frame()//leave iframe to webpage
        .elementByCss('.subscribe-success').text().should.eventually.include('Subscribed')

        .notify(done);
      }
    }
  });

  it("should logout", function (done){

    browser.elementByCss('#myAccountButton').click()//logout process
    .elementByCss('#logoutLink > a').click();

    setTimeout(delay,waitLogout);//sometimes doesn't load quite fast enough
    function delay(){

      browser.elementByCss('head > title').displayed().should.eventually.equal(true)//cannot chain notify after click
      .notify(done);
    }
  });
    
  it("should notify that you are already subscribed if trying to subscribe and you are subscribed", function (done) {

    browser.elementByCss('#meetings > a').click();//meetings link

    setTimeout(delay,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay(){

      //click on national newsletter
      browser.elementByCss('.subscribe-btn-container.center.cq-cc-subscribe-anonymous.cq-cc-subscribe-not-anonymous').click();

      setTimeout(delay2,waitFlyoutTimeout);//sometimes doesn't load quite fast enough
      function delay2(){

        browser.frame(0)//switch to iframe
          .elementByCss('#userid').type('acstest_g')//username
          .elementByCss('#password').type('password')//password
          .elementByCss('#bd .action > input').click()//login button
          .elementByCss('body > h3').text().should.eventually.equal('You have already subscribed to this newsletter')//header should now display this
        .frame()//leave iframe to webpage
        .elementByCss('.subscribe-success').text().should.eventually.include('Subscribed')

        .notify(done);
      }
    }
  }); 

  it("should logout", function (done) {

    browser.elementByCss('#myAccountButton').click()//logout process
    .elementByCss('#logoutLink > a').click();

    setTimeout(delay,waitLogout);//sometimes doesn't load quite fast enough
    function delay(){

      browser.elementByCss('head > title').displayed().should.eventually.equal(true)//cannot chain notify after click
      .notify(done);
    }
  }); 

  it("should open the homepage.", function (done) {
      browser.get(domain + "/content/acs/en.html").fin(function(){
      done();
      });
    });

});
