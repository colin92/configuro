#! /usr/bin/env node

'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var prompt = Promise.promisifyAll(require('prompt'));
var _ = require('lodash');
var Path = require('path');

var writeConfigFile = function writeConfigFile(path, fileString) {
  var file = '// Replace the values below with your own configuration\n' + 
    'var config = ' + JSON.stringify(fileString, null, 2) +
    '\nmodule.exports = config[process.env.NODE_ENV];\n'
  return fs.writeFileAsync(path, file, 'utf-8');
};

var readAndParseConfigFile = function readAndParseConfigFile(path) {
  return fs.readFileAsync(path, 'utf-8')
  .then(function(file) {
    // Remove comments
    return file.replace(/\/\/.*\n/, '').replace('var config =', '')
    .replace('\nmodule.exports = config[process.env.NODE_ENV];\n', ''); 
  })
  .then(function(file) {
    return JSON.parse(file); 
  })
  .then(null, function(err) {
    console.log('Error: '.red, err); 
  });
};

var mergeConfigUpdates = function mergeConfigUpdates(currExample, currConfig) { 
  var updatedExample = Object.create(currExample);
};

var getConfigFile = function getConfigFile() {
  return readAndParseConfigFile(Path.join(__dirname, 'config.js'));
};

var getConfigExampleFile = function getConfigExampleFile() {
  return readAndParseConfigFile(Path.join(__dirname, 'config.js'));
};

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
  return writeConfigFile(Path.join(__dirname, 'config.js'), newFile)
  .then(function() {
    return writeConfigFile(Path.join(__dirname, 'config.example.js'), newFile); 
  });
};

var updateConfig = function updateConfig() {
  var currConfig, currExample, updatedConfig, updatedExample;
  return getConfigFile()
  .then(function(_currConfig) {
    currConfig = _currConfig;
    return getConfigExampleFile();
  })
  .then(function(_currExample) {
    currExample = _currExample;
    return mergeConfigUpdates(currExample, currConfig);
  })
  .then(function(mergedConfigs) {
    updatedExample = mergedConfigs[0];  
    updatedConfig = mergedConfigs[1];  
    return writeConfigFile(Path.join(__dirname, 'config.example.js'), updatedExample); 
  })
  .then(function() {
    return writeConfigFile(Path.join(__dirname, 'config.js'), updatedConfig);
  });

};

prompt.start();

if(process.argv.indexOf('new') + 1) {
  var newConfig = false;
  fs.readdirAsync(__dirname)
  .then(function(dir) {
    return (dir.indexOf('config.js') + 1) || (dir.indexOf('config.example.js') +1);
  })
  .then(function(isFile) {
    if(isFile) {
      console.log('config.js already exists. Are you sure you want ot overwrite? [Y/n] '.magenta);
      return prompt.getAsync(['answer']);
    }
    else {
      newConfig = true;
      return createNewConfig();
    }
  })
  .then(function(result) {
    if(newConfig) return;
    else if(result.answer || result.answer.match(/Y|y|Yes|yes/i)) 
      return createNewConfig();
    else {
      console.log('Aborting config creation.'.red);
      process.exit();
    }
  })
  .then(null, function(err) {
    console.log('Error: '.red, err); 
  });
}

