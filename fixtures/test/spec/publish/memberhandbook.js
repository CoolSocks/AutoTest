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
    "tags": ["memberhandbook.js"],
    "name": "member handbook tests",
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
    , tags: ["memberhandbook.js"]
    , name: "member handbook test"
  };
}

var domain = "http://cmswwwtst.acs.org";

//to shorten testing times as much as possible
//depends on browser, saucelabs, internet speed, etc
var waitPageTimeout = 5000;//when going to a new page for page elements to load
var waitFlyoutTimeout = 3000;//and lightbox, window resize, search as you type
var waitCarouselTimeout = 3000;//switching slides in carousel
var waitGameTimeout = 5000;//game to load

if(browserToUse === 'chrome' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitFlyoutTimeout = 2500;
  waitGameTimeout = 5000;

}
if(browserToUse === 'firefox' && saucelabsUsed === false){//can do less but will lead to random errors from loading times
  waitPageTimeout = 4000;
  waitFlyoutTimeout = 3000;
  waitGameTimeout = 5000;

}
if(browserToUse === 'chrome' && saucelabsUsed === true) {
  waitPageTimeout =5000;
  waitFlyoutTimeout =3000;
  waitGameTimeout =5000;

}

//etc add as needed

describe('MemberHandbook', function(){

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


  describe('member handbook', function(){//takes you out of test environment/test environment version is bad

    it("should display periodic table and confirm responsiveness", function (done) {

      browser.elementByCss('#membership-and-networks > a').click();

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt load fast enough
      function delay1(){

        browser.elementByCss('#bd > div > div.span9 > div > div.columnsBootstrap.parbase.section > div > div:nth-child(1) > div > div:nth-child(1) > div > ul:nth-child(2) > li:nth-child(5) > a')//member handbook
        .click().setWindowSize(1400,1000);//on mac chrome's maximize isn't big enough to make periodic table appear 1400,990

        setTimeout(delay2,waitPageTimeout);//sometimes doesnt maximize/load fast enough
        function delay2(){

          browser.elementByCss('#periodic-table').displayed().should.eventually.equal(true)//determine if css appeared
          .elementByCss('.clearfix.isotope').displayed().should.eventually.equal(true)
          //also gets triggered by just clearfix which means in saucelabs when browser size isn't big enough to get full periodic table this will still be true
          //don't know how to fix
          .setWindowSize(480, 854);//tests responsiveness (class of periodic table changes with the size)

          setTimeout(delay3,waitFlyoutTimeout);//sometimes doesnt switch fast enough
          function delay3(){

            browser.elementByCss('.clearfix').displayed().should.eventually.equal(true)
            .notify(done);
          }
        }
      }
    });

    it("should maximize page", function (done) {//firefox will sometimes skip over this with no errors being shown before or immediatley after????
      browser.setWindowSize(1400,990);     
      done();
    });

    it("should test functionality of lightboxes", function (done) {

      setTimeout(delay1,waitFlyoutTimeout);//sometimes doesnt load/maximize fast enough
      function delay1(){

        //browser.elementByCss('#periodic-table > ul:nth-child(7) > li:nth-child(8)')//not working in test
        browser.elementByCss('#periodic-table > ul:nth-child(6) > li:nth-child(4)')//not the actual production layout (test only)
        .click();//POD element

        setTimeout(delay2,waitFlyoutTimeout);//sometimes doesnt load fast enough
        function delay2(){

          browser.elementByCss('.span8.element-description > h3 > a')
          .text().should.eventually.equal("ACS Presentations on Demand")//check lightbox text
        
          .elementByCss('body > div.mfp-wrap.mfp-gallery.mfp-close-btn-in.mfp-auto-cursor.mfp-ready > div > button.mfp-arrow.mfp-arrow-right.mfp-prevent-close')
          .click();//clicks arrow to go to next element

          setTimeout(delay3,waitFlyoutTimeout);//sometimes doesnt switch fast enough
          function delay3(){

            browser.elementByCss('.span8.element-description > h3 > a')
            //.text().should.eventually.equal("ACS Open Access")//checks lightbox text (now Oa element) (not working in test)
            .text().should.eventually.equal("LinkedIn")//(test only)
            .notify(done);
          }
        }
      }
    });

    it("should close lightbox", function (done) {

      browser.elementByCss('.mfp-close').click();//closes lightbox

      setTimeout(delay,waitFlyoutTimeout);//sometimes doesnt switch fast enough
      function delay(){

        browser.title().should.become("Member Handbook")
        .notify(done);
      }
    });

    it("should test functionality of periodic table", function (done) {
    //doesn't work as it should in saucelabs because window size isn't big enough to trigger whole periodic table

      browser.elementByCss('#periodic-table > nav > div.category2 > a > i').click();//goes to scientific resources category

      setTimeout(delay1,waitPageTimeout);//sometimes doesnt switch fast enough
      function delay1(){

        //browser.elementByCss('#bd > div.articleContentAboveElements.parsys > div:nth-child(1) > div > div.span8.element-description > h3 > a')//checks the first link (pod) //incorrect layout in test
        //.text().should.eventually.equal("ACS Presentations on Demand")
        browser.elementByCss('#bd > div.parsys.articleContentElements > div:nth-child(1) > div > div.span8.element-description > h3')//test only
        .text().should.eventually.equal("Green chemisty Institute")//test only

        //.elementByCss('#bd > div.articleContentAboveElements.parsys > div:nth-child(2) > div > div.span8.element-description > h3 > a')//checks second (Oa) //incorrect layout in test
        //.text().should.eventually.equal("ACS Open Access")
        .elementByCss('#bd > div.parsys.articleContentElements > div:nth-child(2) > div > div.span8.element-description > h3 > a')// test only
        .text().should.eventually.equal("Chemical & Engineering News (C&EN)")//test only

        .elementByCss('#bd > div.row-fluid > header > nav > a:nth-child(1) > div > i').click();//clicks meetings and networking header bar

        setTimeout(delay2,waitPageTimeout);//sometimes doesnt switch fast enough
        function delay2(){

          //browser.elementByCss('.span8.element-description > h3 > a')//checks first link (Nm)//incorrect in test
          //.text().should.eventually.equal("ACS National Meetings")//incorrect in test
          browser.elementByCss('#bd > div.parsys.articleContentElements > div:nth-child(1) > div > div.span8.element-description > h3 > a')//test only
          .text().should.eventually.equal("ACS National Meetings and Much More")//test only
          .notify(done);
        }
      }
    });
  });

});