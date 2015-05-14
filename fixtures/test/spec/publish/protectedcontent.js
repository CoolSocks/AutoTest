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
    "tags": ["protectedcontent.js"],
    "name": "protectedcontent tests",
    "tunnel-identifier": sauceid
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
    , tags: ["protectedcontent.js"]
    , name: "protectedcontent test"
  };
}

var domain = "http://www.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitLogout = 5000;

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4500;
  waitLogout =4500;
  
}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 5000;
  waitLogout = 6000;
  
}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
  waitLogout = 5000;
  
}

describe('protected content', function(){

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

    it("should set cookies", function (done) {

      setTimeout(delay1,waitPageTimeout);
      function delay1(){

        browser.deleteAllCookies();

        setTimeout(delay2,waitPageTimeout);
        function delay2(){
          //hopefully will not need to update cookie values
          //need one or the other but both doesn't hurt
          browser.setCookie({name:'fsr.r',value:'%7B%22d%22%3A90%2C%22i%22%3A%22de37435-93627389-c82a-9114-d8d84%22%2C%22e%22%3A1405712447504%7D'});
          browser.setCookie({name:'fsr.s',value:'%7B%22f%22%3A1405107628060%2C%22v%22%3A1%2C%22rid%22%3A%22de37435-93627389-c82a-9114-d8d84%22%2C%22r%22%3A%22www.acs.org%22%2C%22st%22%3A%22%22%2C%22to%22%3A2%2C%22pv%22%3A2%2C%22lc%22%3A%7B%22d0%22%3A%7B%22v%22%3A2%2C%22s%22%3Atrue%7D%7D%2C%22cd%22%3A0%2C%22sd%22%3A0%2C%22i%22%3A-1%2C%22l%22%3A%22en%22%7D'});
        
          done();
        }
      }
    });

      //possible other solution although not foolproof:

      // setTimeout(delay1,waitForesee1);
      // function delay1(){
      
      //   browser.eval('$$FSR.enabled=false');

      //   setTimeout(delay2,waitForesee);
      //   function delay2(){

      //      browser.eval('$$FSR.enabled').then(function (fulfilled){
      //         console.log('homepage>>>>>'+fulfilled);
      //      },function (notfulfilled){
      //         console.log('homepage>>>>>error');
      //      });

      // add this everytime a page is loaded where a Foresee popup could interfere
      // the popups are an iframe so elements not covered by it can be found
      // but it does block the page so links cannot be used

      // if the console says true, then add more time to the wait since it 
      // is applying the eval to the previous URL.

      // if the console says error, there is no Foresee on that page or the 
      // same case as true is occuring but there is no previous page (it is running
      // the eval before foresee loads) or the previous page has no Foresee so
      // either add more time or remove it based on the situation

      // It should say false for it to be correct, but if a popup still occurs
      // wait needs to be lessened becuase it is not running the eval fast enough
      // or it could be too fast and reading from previous page if eval was run on that

      // try to be smart with using links/css identifiers so that popupts won't 
      // affect the test and try to use pages blocking foresee (which are viewable in 
      // one of the foresee js files in the browser for www.acs.org) so that the need 
      // for the evals/waits is lessened

      // will greatly reduce chances of popups but not foolproof

  it("should open the acs homepage.", function (done) {

    setTimeout(delay1,waitPageTimeout);
    function delay1(){
      browser
      .get(domain + "/content/acs/en.html").fin(function(){     
        done();
      });
    }
  });

  describe('No Permission',function() {

    it("login with account without access", function (done) {
         
      browser.maximize().elementByCss('#loginLink > a').click();
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.eval('window.location.href')
        .should.eventually.include('/idp/default_login.jsp?pageURL='+ domain +'/bin/acs/sso/login&loginStyle=normal')
        .title().should.become('American Chemical Society Login')

        .elementById('userid').type('gabriel.ritter')
        .elementById('password').type('ACS2013')
        .elementByCss('.action > input[type="submit"]').click();

        setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay2(){

          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')

          .notify(done);
        }
      }   
    });

    it("should get the webpage to get to salary archive", function (done) {

      browser.get(domain + "/content/dam/acsorg/careers/salaries/archive/salaries-2010.pdf").fin(function(){
        done();     
      });
    });

    it("should say the account doesn't have access", function (done) {
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
          
        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > h2 > b')      
        .text().should.eventually.equal('We\'re sorry.')
        browser.title().should.become('401: Unauthorized - American Chemical Society')

        .notify(done);
      }
    });

    it("should get the webpage to get to starting salaries", function (done) {

      browser.get(domain + "/content/dam/acsorg/careers/salaries/starting-salaries-archive/new-graduates-2012.pdf").fin(function(){  
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > h2 > b')      
        .text().should.eventually.equal('We\'re sorry.')
        browser.title().should.become('401: Unauthorized - American Chemical Society')

        .notify(done);
      }
    });
    
    it("should get the webpage to richard schrock", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/richard-schrock").fin(function(){        
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });

    it("should get the webpage to martin chalfie", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/martin-chalfie.html").fin(function(){ 
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {//may need to clear browser cache if you already ran the test

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });

    it("should get the webpage to Eli Pearce", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/eli-pearce.html").fin(function(){        
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {//may need to clear browser cache if you already ran the test

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });

    it("should get the webpage to Nadrian Seeman", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/nadrian-seeman.html").fin(function(){ 
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {//may need to clear browser cache if you already ran the test

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });

    it("should get the webpage to robert lefkowitz", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/robert-lefkowitz").fin(function(){ 
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {//may need to clear browser cache if you already ran the test
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });

    it("should get the webpage to webinars", function (done) {

      browser.get(domain + "/content/acs/en/events/acs-webinars.html").fin(function(){
        done();
      });
    });

    it("should say the account doesn't have access", function (done) {//may need to clear browser cache if you already ran the test
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div > div > div > div > div > div > p:nth-child(2)')
        .text().should.eventually.equal('Access to this area is restricted. You aren\'t authorized to view this page.')

        .notify(done);
      }
    });
  });

  describe('Permission',function() {

    it("should logout and login to account with access", function (done) {

      browser.elementByCss('#myAccountButton').click()
      .elementByCss('#logoutLink > a').click();
        
      setTimeout(delay1,waitLogout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementById('userid').type('rachurch')
        .elementById('password').type('gabby1')
        .elementByCss('.action > input[type="submit"]').click();
        
        setTimeout(delay2,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay2(){

        browser.elementByCss('#global-logo > div > a').displayed().should.eventually.equal(true)
        .notify(done); 
        }
      }   
    });


    it("should get the webpage to get to salary archive", function (done) {

      browser.get(domain + "/content/dam/acsorg/careers/salaries/archive/salaries-2010.pdf").fin(function(){
        done();     
      });
    });

    it("should test salary archive access", function (done) {
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
          
        if (browserToUse === 'chrome') { //since chrome embeds but firefox doesn't

          browser.elementByCss('body > embed').displayed().should.eventually.equal(true)//pdf should display
          .notify(done);
        }
        else if (browserToUse === 'firefox') {

          browser.elementByCss('#pageContainer1 > div:nth-child(2)').displayed().should.eventually.equal(true)//pdf should display
          .notify(done);
        }
      }
    });

    it("should get the webpage to get to starting salaries", function (done) {

      browser.get(domain + "/content/dam/acsorg/careers/salaries/starting-salaries-archive/new-graduates-2012.pdf").fin(function(){  
        done();
      });
    });

    it("should tests starting salary access", function (done) {
      
      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
          
        if (browserToUse === 'chrome') { //since chrome embeds but firefox doesn't

          browser.elementByCss('body > embed').displayed().should.eventually.equal(true)//pdf should display
          .notify(done);
        }
        else if (browserToUse === 'firefox') {

          browser.elementByCss('#pageContainer1 > div:nth-child(2)').displayed().should.eventually.equal(true)//pdf should display
          .notify(done);
        }
      }
    });

    it("should get the webpage to richard schrock", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/richard-schrock").fin(function(){        
        done();
      });
    });

    it("should test Richard Schrock access", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.title.articleTitle > h1').text()
        .should.eventually.equal('Richard Schrock')
                
        .notify(done);
      }
    });

    it("should get the webpage to martin chalfie", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/martin-chalfie.html").fin(function(){ 
        done();
      });
    });

    it("should test access martin chalfie", function (done) {

        setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
        function delay1(){

          browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.title.articleTitle > h1').text()
          .should.eventually.equal('Martin Chalfie')
                
          .notify(done);
        }
      });

    it("should get the webpage to Eli Pearce", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/eli-pearce.html").fin(function(){        
        done();
      });
    });

    it("should test access Eli Pearce.", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.title.articleTitle > h1').text()
        .should.eventually.equal('Dr. Eli M. Pearce')
                
        .notify(done);
      }
    });

    it("should get the webpage to Nadrian Seeman", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/nadrian-seeman.html").fin(function(){ 
        done();
      });
    });

    it("should test access nadrian seeman", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.title.articleTitle > h1').text()
        .should.eventually.equal('Dr. Nadrian Seeman')
                
        .notify(done);
      }
    });

    it("should get the webpage to robert lefkowitz", function (done) {

      browser.get(domain + "/content/acs/en/membership-and-networks/acs/benefits/chemistry-over-coffee/robert-lefkowitz").fin(function(){ 
        done();
      });
    });

    it("should test robert lefkowitz access", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){
        browser.elementByCss('#bd > div.row-fluid > div.span9.article-body > div.title.articleTitle > h1').text()
        .should.eventually.equal('Robert Lefkowitz')//pdf should display
                
        .notify(done);
      }
    });

    it("should get the webpage to webinars", function (done) {

      browser.get(domain + "/content/acs/en/events/acs-webinars.html").fin(function(){
        done();
      });
    });

    it("should test access webinars", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#bd > div.row-fluid > div > div.title.articleTitle > h1').text()
        .should.eventually.equal('Member\'s Only Archive')//pdf should display
                
        .notify(done);
      }
    });


    it("should open the acs homepage.", function (done) {

      browser.get(domain + "/content/acs/en.html").fin(function(){
        done();
      });
    });

    it("should logout", function (done) {

      setTimeout(delay1,waitPageTimeout);//sometimes doesn't load quite fast enough
      function delay1(){

        browser.elementByCss('#myAccountButton').click()
        .elementByCss('#logoutLink > a').click();
        
        setTimeout(delay2,waitLogout);//sometimes doesn't load quite fast enough
        function delay2(){

          browser.eval('window.location.href')
          .should.eventually.include('/content/acs/en.html')

          .notify(done);
        }
      }
    });
  });
//can't do bea ones until get account with right permissions.
//for each one just need to copy the entire describe from the last test
//fill in correct account info, relabel descriptions,
//update URL, and CSS path
});