#! /usr/bin/env node

var cmd = require('test-cmd')
  , adapter = require('./asynct')

if(!module.parent)
  cmd.go(adapter)