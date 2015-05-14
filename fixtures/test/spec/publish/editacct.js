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
    "tags": ["editacct.js"],
    "name": "editacct tests",
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
    , tags: ["editacct.js"]
    , name: "editacct test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitLogout = 5000;

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;

}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;

}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
}

//etc add as needed

describe('edit account (phone number)', function(){

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

  it("should edit phone number", function (done) {

    browser.elementByCss('#loginLink').click()

    setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay1(){

      .elementById('userid')         
      .type('acstest_coreM15')//login
      .elementById('password')
      .type('password')
      .elementByCss('.action > input[type="submit"]').click();

      setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay2(){

        browser.eval('window.location.href')
        .should.eventually.include('/content/acs/en.html')
        .elementByCss('#myAccountButton').click()//account menu
        .elementByCss('#myAccountLink').click();//go to account

        setTimeout(delay3,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay3(){

          browser.elementByCss('#profile-nav > li:nth-child(1) > a').click();//edit profile

          setTimeout(delay4,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay4(){

            browser.elementByCss('#mapp_pma_editprofile_portlet_2myform > div:nth-child(4) > table > tbody > tr:nth-child(17) > td:nth-child(3) > b > input[type="text"]')//confirm email
            .type("olsen@XXXaecom.yu.edu")
            .elementByCss('#mapp_pma_editprofile_portlet_2myform > div:nth-child(4) > table > tbody > tr:nth-child(13) > td:nth-child(3) > b > input[type="text"]')
            .doubleClick().type("2029990000")//overwrite old phone number
            .elementByCss('#mapp_pma_editprofile_portlet_2okButton').click();//submit

            setTimeout(delay5,waitPageTimeout);//sometimes doesn't load quite fast enough
            function delay5(){

              browser.title().should.become("American Chemical Society - The world's largest scientific society.")//confirms no error in submit

              .notify(done);
            }
          }
        }
      }
    }
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

  it("should confirm edit phone number", function (done) {

    browser.elementByCss('#myAccountButton').click()//account menu
    .elementByCss('#myAccountLink').click();//go to account

    setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay1(){

      browser.elementByCss('#profile-nav > li:nth-child(1) > a').click()//go back to edit profile

      setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay2(){

        .elementByCss('#mapp_pma_editprofile_portlet_2myform > div:nth-child(4) > table > tbody > tr:nth-child(13) > td:nth-child(3) > b > input[type="text"]')
        .getAttribute("value").should.eventually.equal('2029990000')//confirm new number

        .notify(done);
      }
    }
  });

  it("should logout", function (done) {

    browser.elementByCss('#myAccountButton').click()//logout process
    .elementByCss('#logoutLink > a').click();

    setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
    function delay1(){

      browser.elementByCss('head > title').displayed().should.eventually.equal(true)//cannot chain notify after click

      .notify(done);
    }
  });

});


