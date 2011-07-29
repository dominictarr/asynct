#! /usr/bin/env node

var cmd = require('test-cmd')
  , asynct = require('./asynct')

if(!module.parent)
  cmd.go(asynct)