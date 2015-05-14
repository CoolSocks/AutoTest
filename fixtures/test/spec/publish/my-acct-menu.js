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
    "tags": ["my-acct-menu.js"],
    "name": "my-acct-menu tests",
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
    , tags: ["my-acct-menu.js"]
    , name: "my-acct-menu test"
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

//updated test accounts and renewal url for test "should navigate to the 'renewal'... "

describe('my acct menu', function(){

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

  describe('As an ACS Member (Renewal Eligible), the My Account Menu', function(){

    it("should display the \"Login\" button", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
      browser.elementByCss('#loginLink > a').displayed()
        .should.eventually.equal(true)
        .notify(done);
      }
    });

    it("should navigate to the login page", function (done) {
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

    it("should login as an ACS Member who should renew", function (done) {
      // open the homepage
      browser
        .elementById('userid')
          .type('acstest_coreM15')
          // .type('rhtest')
        .elementById('password')
          .type('password')
        .elementByCss('.action > input[type="submit"]').click();

        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay1(){

          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .notify(done);
        }
    });

    it("should display a \"my account\" button with the users name", function (done){
      browser
        .elementByCss('#myAccountButton')
        .displayed()
          .should.eventually.equal(true)
        .elementByCss('#myAccountButton')
          .text().should.become('Laurence Olsen')
          .notify(done);
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

    it("should display a link to 'My Account'", function (done) {
      browser
        .elementByCss('#myAccountLink > a')
          .text().should.become('My Account')
        .elementByCss('#myAccountLink > a')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });

    it("should display a link 'Renew membership'", function (done) {
      browser
        .elementByCss('#renewLink > a')
          .text().should.become('Renew')
        .elementByCss('#renewLink > a')
          .displayed().should.eventually.equal(true)
          .elementByCss('#notify-renewal > b')
          .text().should.become('Renew now?')
        .notify(done);
    });

    it('should not have a link to "Join ACS"', function (done){
        browser
          .elementByCss('#myAccountMenu')
          .elementByCss('>', '#joinLink')
            .displayed().should.eventually.equal(true)
            .should.be.rejectedWith(/status: 7/) // no 'renew link' subelement
          .notify(done);
    });

    // The renew app link is current pointed at http://portal.acs.org/portal/PublicWebSite/index.htm
    // This URL is PROD only and dosnt correctly redirect to the CQ5 homepage.
    // it("should navigate from the 'Renew Account' page back to the Homepage", function (done){
    //     browser
    //       .elementByCss('.acs-logo').click()
    //         .eval('window.location.href')
    //         .should.eventually.include(domain + "/content/acs/en.html")
    //       .notify(done);
    // });

    it("should navigate to the 'Renew Account' (OMR) page", function (done) {
      browser
        .get(domain + "/content/acs/en.html");
        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .elementByCss('#myAccountButton').displayed()
          .should.eventually.equal(true)
          .click()    
        // click the renew link
          .elementByCss('#renewLink > a').click();
          setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay2(){
            browser.eval('window.location.href')
            .should.eventually.include('www.renewtest.acs.org/renew/invoice/invoiceedit.htm?site=ACS')
        // verify we are logged into the renew app
            .elementByCss('.app-logo > h2').text()
            .should.become('Online Membership Renewal')
            .notify(done);
          }
        }
    });

    it("should navigate to the 'Manage Account' page", function (done) {
      browser  
        .get(domain + "/content/acs/en.html");
        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .elementByCss('#myAccountButton').displayed()
          .should.eventually.equal(true);
        
        browser
        .elementByCss('#myAccountButton')
          .click()
        .elementByCss('#myAccountLink')
          .click();
          setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay2(){
            browser.eval('window.location.href')
            .should.eventually.include('linuxportaltest.acs.org/portal/acs/corg/memberapp')
            .notify(done);
          }
        }    
    });

    it("should return to the ACS Homepage", function (done) {
      browser  
        .get(domain + "/content/acs/en.html");
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

    it("should display a link to Log Out", function (done) {
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
          setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
          function delay1(){
            browser.eval('window.location.href')
            .should.eventually.include('/content/acs/en.html')
            .notify(done);
          }
    });

    it("should display the \"Login\" button", function (done) {
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

  describe('As an ACS Member (nonrenewal), the My Account Menu', function () {

    it("should open the acs homepage", function (done) {
      browser
        .get(domain + "/content/acs/en.html").fin(function(){
          done();
        });
    });

    it("should display the \"Login\" button", function (done) {
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
        browser.elementByCss('#loginLink > a').displayed()
        .should.eventually.equal(true)
        .notify(done);
      }
    });

    it("should navigate to the login page", function (done) {
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

    it("should login as an ACS Member (non renewal)", function (done) {
      // open the homepage
      browser
        .elementById('userid')
          .type('acstest_V15')
          // .type('rhtest')
        .elementById('password')
          .type('password')
        .elementByCss('.action > input[type="submit"]').click();

        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .notify(done);
        }
    });

    it("should display a \"my account\" button with the users name", function (done){
      browser
        .elementByCss('#myAccountButton')
        .displayed()
          .should.eventually.equal(true)
        .elementByCss('#myAccountButton')
          .text().should.become('Christopher Russin')
          .notify(done);
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

    it('should not have a link Account Renewal', function (done){
        browser
          .elementByCss('#myAccountMenu')
          .elementByCss('>', '#renewLink')
            .displayed().should.eventually.equal(true)
            .should.be.rejectedWith(/status: 7/) // no 'renew link' subelement
          .notify(done);
    });

    it('should not have a link to "Join ACS"', function (done){
        browser
          .elementByCss('#myAccountMenu')
          .elementByCss('>', '#joinLink')
            .displayed().should.eventually.equal(true)
            .should.be.rejectedWith(/status: 7/) // no 'renew link' subelement
          .notify(done);
    });

    it("should display a link to 'My Account'", function (done) {
      browser
        .elementByCss('#myAccountLink > a')
          .text().should.become('My Account')
        .elementByCss('#myAccountLink > a')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });
    
    it("should navigate to the 'Manage Account' page", function (done) {
      browser  
        .elementByCss('#myAccountLink > a')
          .click();
          setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay1(){
            browser.eval('window.location.href')
            .should.eventually.include('linuxportaltest.acs.org/portal/acs/corg/memberapp')
            .notify(done); 
          }
    });

    it("should return to the ACS Homepage", function (done) {
      browser  
        .get(domain + "/content/acs/en.html");
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

    it("should display a link to Log Out", function (done) {
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
          setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
          function delay1(){
            browser.eval('window.location.href')
            .should.eventually.include('/content/acs/en.html')
            .notify(done);
          }
    });

    it("should display the \"Login\" button", function (done) {
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

  describe('As an ACS Non-Member, the My Account Menu', function () {

    it("should open the acs homepage", function (done) {
      browser
        .get(domain + "/content/acs/en.html").fin(function(){
          done();
        });
    });

    it("should display the \"Login\" button", function (done) {
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
        browser.elementByCss('#loginLink > a').displayed()
        .should.eventually.equal(true)
        .notify(done);
      }
    });

    it("should navigate to the login page", function (done) {
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

    it("should login as an ACS Member (non member)", function (done) {
      // open the homepage
      browser
        .elementById('userid')
          .type('acstest_jketola')
          // .type('rhtest')
        .elementById('password')
          .type('password')
        .elementByCss('.action > input[type="submit"]').click();
        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){
          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')
          .notify(done);
        }
    });

    it("should display a \"my account\" button with the users name", function (done){
      browser
        .elementByCss('#myAccountButton')
        .displayed()
          .should.eventually.equal(true)
        .elementByCss('#myAccountButton')
          .text().should.become('Enrique Eglesia')
          .notify(done);
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

    it('should not have a link to "Account Renewal"', function (done){
        browser
          .elementByCss('#myAccountMenu')
          .elementByCss('>', '#renewLink')
            .displayed().should.eventually.equal(true)
            .should.be.rejectedWith(/status: 7/) // no 'renew link' subelement
          .notify(done);
    });

    it("should display a link to 'Join ACS'", function (done) {
      browser
        .elementByCss('#joinLink > a')
          .text().should.become('Join ACS')
        .elementByCss('#joinLink > a')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });

    it("should display a link to 'My Account'", function (done) {
      browser
        .elementByCss('#myAccountLink > a')
          .text().should.become('My Account')
        .elementByCss('#myAccountLink > a')
          .displayed().should.eventually.equal(true)
        .notify(done);
    });
    
    it("should navigate to the 'Manage Account' page", function (done) {
      browser  
        .elementByCss('#myAccountLink > a')
          .click();
          setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
          function delay1(){
            browser.eval('window.location.href')
            .should.eventually.include('linuxportaltest.acs.org/portal/acs/corg/memberapp')
            .notify(done);
            } 
    });

    it("should return to the ACS Homepage", function (done) {
      browser  
        .get(domain + "/content/acs/en.html");
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

    it("should display a link to Log Out", function (done) {
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
          setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
          function delay1(){  
            browser.eval('window.location.href')
            .should.eventually.include('/content/acs/en.html')
            .notify(done);
          }
    });

    it("should display the \"Login\" button", function (done) {
      browser
        .get(domain + "/content/acs/en.html");
        setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
          function delay1(){  
        browser.elementByCss('#loginLink').displayed()
          .should.eventually.equal(true)
        .notify(done);
      }
    });
  });


});




