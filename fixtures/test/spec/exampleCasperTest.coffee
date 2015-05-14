casper.test.begin "ACS.org Sanity Test", 1, suite = (test) ->
  casper.start "http://www.acs.org/content/acs/en.html", ->
    test.assertTitle "American Chemical Society", "Title is as expected"

  casper.then ->
    ""

  casper.run ->
    test.done()