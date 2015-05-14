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
    "tags": ["fcreateacct.js"],
    "name": "create account tests",
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
    , tags: ["createacct.js"]
    , name: "create account test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waiLogout = 5000;
if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  var waiLogout = 5000;
}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  var waiLogout = 5000;

}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
  var waiLogout = 5000;
}

//etc add as needed

describe('create account', function(){

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

  it("should create a new account", function (done) {

    browser.elementByCss('#loginLink > a').click();

    setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay1(){

      browser.elementByCss('#bd > div > div > div.signup > a').click();

      setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay2(){
        //eventually add a file or something that will increment a number to be  used as name/email@none.com
        //go to 10minutemail.com and get temporary email
        browser.elementByCss('#email').type("a6014847@drdrb.net")
        .elementByCss('#firstName').type("testy3")//will need to change these everytime test is run
        .elementByCss('#lastName').type("testy3")
        .elementByCss('#userName').type("acstest_testy3")
        .elementByCss('#passwordPwd').type("password")
        .elementByCss('#confirmPassword').type("password")
        .elementByCss('#submit_button').click();

        setTimeout(delay3,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay3(){

          browser.elementByCss('#bd > div > div.span4 > h3').text().should.eventually.equal("Account Created")

          .notify(done);
        }
      }
    }
  });

  it("should verify logged in to new account", function (done) {

    browser.elementByCss('#bd > div > div.span8 > div > div > fieldset > div.form-actions > input').click();//takes to homepage

    setTimeout(delay,waitPageTimeout);//sometimes doesn't load quite fast enough
    function delay(){

      browser.elementByCss('#welcome-username').text().should.eventually.equal("testy3 testy3")
      .notify(done);
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


});




