#! /usr/bin/env node

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var prompt = Promise.promisifyAll(require('prompt'));


var createNewConfig = function createNewConfig() {
  var newFile = {  };
  newFile.development = {
    database: {
      name: 'default-dev',
      hostName: 'localhost',
      port: '27017'
    },
    server: {
      port: '3000'
    }
  };
  newFile.production = {
    database: {
      name: 'default-production',
      hostName: 'localhost',
      port: '27017'
    },
    server: {
      port: '3000'
    }
  };
  var fileString = '// Replace the values below with your own configuration\n' + 
    'var config = ' + JSON.stringify(newFile, null, 2) +
    '\nmodule.exports = config[process.env.NODE_ENV];\n'
  return fs.writeFile('./config.js', fileString, 'utf-8');
};

prompt.start();

if(process.argv.indexOf('new') + 1) {
  fs.statAsync('./config.js')
  .then(function(stat) {
    return stat.isFile();
  })
  .then(function(isFile) {
    if(isFile) {
      console.log('config.js already exists. Are you sure you want ot overwrite? [Y/n] '.magenta);
      return prompt.get(['answer']);
    }
    else {
      return createNewConfig();
    }
  })
  .then(function(result) {
    if(result.answer.match(/Y|y|Yes|yes/i)) 
      return createNewConfig();
    else {
      console.log('Aborting config creation.'.red);
      process.exit();
    }
  });
}
