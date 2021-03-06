//asynct.js

//simple async test adapter

var assert = require('assert')
  , ctrl = require('ctrlflow') 
  , isSetup = /^__?setup$/
  , isTeardown = /^__?teardown$/
  , isSetupTeardown = /^__?(setup|teardown)$/

exports.run = function (tests,reporter,callback) {

//
// move the shutdown function out, and if a test is a function
// treat it as aset of tests and opperate on it recursively.
//

  function run (tests,reporter,callback) {
    var status = {}
    var setup = [], teardown = []
    var names = Object.keys(tests).filter(function (name){
      if(isSetup.test(name))
        setup.push(name)
      else if (isTeardown.test(name))
        teardown.push(name)
      else return true
    })
  
    names = setup.concat(names).concat(teardown)
  
    var tests = names.map(function (name){
      var test = tests[name]
      status[name] = 'not started'
      return function (){
        var __next = this.next
          , finishAlready = false

        if(!isSetupTeardown.test(name)) //don't report setup and teardown unless there is an error.
          reporter.test(name)
        
        function next (){
          status[name] = 'finished'
          if(finishAlready)
            return reporter.test(name,new Error('test \'' + name + '\' called finish twice'))
          finishAlready = true
          __next()
        }
    
        function error(err){
          reporter.test(name,err)
          next()
        }

        var tester = new Tester(name,next,function (err){reporter.test(name,err)})

        function handle(err){
          var catcher = tester.catch || tester.uncaughtExceptionHandler
          if('function' == typeof catcher){
            try{
              catcher(err)
            } catch (err){
              error(err)          
            }        
          } else {
            error(err)
          }
        }
      
        process.removeAllListeners('uncaughtException')
        process.on('uncaughtException',handle)
      
        if ('function' === typeof test) {
          try{ 
            status[name] = 'started'
            test.call(null,tester) 
            if(isTeardown.test(name))
              next()//teardown is sync! .. 
            //on second thoughts this is probably not a good idea.
            //maybe, by hooking process.nextTick and the events you could have an 
            //event loop drain event, so that you know when the process is about to exit.
          } catch (err) {
            handle(err)
          }
        } else {
          run(test, reporter.subreport(name), next)
        }
      }
    })

    ctrl.seq(tests,function (err){throw err}).done(callback).go()

    return function () {
      process.removeAllListeners('uncaughtException')
  
      names.forEach(function (name){
          if(status[name] != 'finished')
            reporter.test(name, "did not finish, state was: " + status[name])
      })
    }
  }

  return run(tests, reporter, callback)
}
Tester.prototype = assert

function Tester (name, next, handler) {
  this.done = next
  this.finish = next
  this.end = next
  this.name = name
  this.catch = null
  this.failure = handler
  this.error = handler
  this.uncaughtExceptionHandler = null
}
