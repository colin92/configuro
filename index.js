#! /usr/bin/env node
var fs = require('fs');

if(process.argv.indexOf('create') + 1) {
  fs.writeFile('./config.js', 'hello world\n', 'utf-8');
}
