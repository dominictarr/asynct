
#asynct

a simple asyncronous test framework for nodejs.

(mostly) api compatible with https://github.com/bentomas/node-async-testing and https://github.com/caolan/nodeunit

##install

`npm install asynct`

##a test

    //test.js
    exports ['test 1'] = function (test) {
    
      //some test assertions here
      
      test.done() //or test.finish()
    
    }

    exports.__setup = function (test) {
      //called before all tests (optional)
      test.done()
    }

    exports.__teardown = function (test) {
      //called after all tests, even if there is an error (optional)
      //test.done() not necessary in teardown
    }

    
run it:

    asynct test.js

##tests

tests are in seperate repo. https://github.com/dominictarr/asynct_tests