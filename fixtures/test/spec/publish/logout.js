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
    "tags": ["logout.js"],
    "name": "footer tests",
    "logout tests":sauceid
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
    , tags: ["logout.js"]
    , name: "logout test"
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

//updated test accounts
describe('Log out', function (done){

    this.timeout(120000);

    before( function (done) {
      browser.init(desired).fin(function(){
        
        done();
      })
    });

    after(function (done) {
      browser.quit();
      setTimeout(done, 500);
    });

    it("should open the acs homepage.", function (done) {
      browser
        .get(domain + "/content/acs/en.html").fin(function(){
          done();
        });
    });

    it("should display the \"Login\" button.", function (done) {
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
        browser.maximize().elementByCss('#loginLink > a').displayed()
        .should.eventually.equal(true)
        .notify(done);
      }
    });

    it("should navigate to the login page.", function (done) {
      // open the homepage
      browser
        .elementByCss('#loginLink > a').click();
        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/idp/default_login.jsp?pageURL='+ domain +'/bin/acs/sso/login&loginStyle=normal')
          .title()
          .should.become('American Chemical Society Login')
        .notify(done);
      }
    });

    it("should login as a TEST user.", function (done) {
      // open the homepage
      browser
        .elementById('userid')
          // .type('ElisabethVoress')
          .type('acstest_coreM15')
        .elementById('password')
          // .type('murphy')
          .type('password')
        .elementByCss('.action > input[type="submit"]').click();
        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .notify(done);
        }
    });

    it("should display the \"my account\" menu when the user clicks their name", function (done){

      // open the my account menu
      browser
        .elementByCss('#myAccountButton')
          .click()
        .elementByCss('#myAccountMenu')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });

    it("should display a link to Log Out.", function (done) {
      browser
        .elementByCss('#logoutLink > a')
          .text().should.become('Log Out')
        .elementByCss('#logoutLink > a')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });

    it("should navigate to the SSO global logout page when the user clicks the log out link", function (done){

      // open the my account menu
      browser
        .elementByCss('#logoutLink  > a')
          .click();
          setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay1(){
            browser.eval('window.location.href')
            .should.eventually.include('/content/acs/en.html')
            .notify(done);
          }
    });

    it("should display the \"Login\" button.", function (done) {
      browser
        .get(domain + "/content/acs/en.html");

        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){

          browser.elementByCss('#loginLink').displayed()
          .should.eventually.equal(true)
          .notify(done);
        }
    });

});
