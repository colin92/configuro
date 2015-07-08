#! /usr/bin/env node

'use strict';

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var prompt = Promise.promisifyAll(require('prompt'));
var _ = require('lodash');
var Path = require('path');

var joinPath = function joinPath(fileName) {
  return Path.join(process.cwd(), fileName);
};
  
// Config template file
var newFile = {};
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

// Write the file to specified location
var writeConfigFile = function writeConfigFile(path, fileJSON) {
  // Takes JSON version of config data, and stringifies it, adding 
  // comments, 'var config =' and 'module.exports' as necessary for the data
  // to be required by an app
  var file = '// Replace the values below with your own configuration\n' + 
    'var config = ' + JSON.stringify(fileJSON, null, 2) +
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
    console.log('Error: '.red, 'Check the syntax of your config and example files!'.yellow);
    console.log('Exiting'.red);
    process.exit();
  });
};

var recursiveObjectCopy = function recursiveObjectCopy(obj, targetObj, defaultVal) {
  var targetObj = targetObj || {};
  if(typeof obj !== 'object' && !(obj instanceof Array)) {
      if(typeof defaultVal === 'string') return defaultVal;
      else {
        return targetObj && typeof targetObj !== 'object' && !(targetObj instanceof Array) ? targetObj : obj; 
      }
  }
  else if(obj instanceof Array) targetObj = [];
  var keys = Object.keys(obj);
  keys.forEach(function(key) {
    targetObj[key] = recursiveObjectCopy(obj[key], targetObj[key], defaultVal);
  });
  return targetObj;
};

var mergeConfigUpdates = function mergeConfigUpdates(currExample, currConfig) { 
  var configCopy = recursiveObjectCopy(currConfig, {}); 
  var exampleCopy = recursiveObjectCopy(currExample, {}); 
  var mergedConfig = recursiveObjectCopy(currExample, configCopy);
  var mergedExample = recursiveObjectCopy(currConfig, exampleCopy, '');
  return [mergedExample, mergedConfig];
};

var getConfigFile = function getConfigFile() {
  return readAndParseConfigFile(joinPath('config.js'));
};

var getConfigExampleFile = function getConfigExampleFile() {
  return readAndParseConfigFile(joinPath('config.example.js'));
};

var createNewConfig = function createNewConfig() {
  return writeConfigFile(joinPath('config.js'), newFile)
  .then(function() {
    return writeConfigFile(joinPath('config.example.js'), newFile); 
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
    return writeConfigFile(joinPath('config.example.js'), updatedExample); 
  })
  .then(function() {
    return writeConfigFile(joinPath('config.js'), updatedConfig);
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
else if(process.argv.indexOf('update') +1) {
  console.log('Updating config and example files...'.magenta);
  fs.readdirAsync(__dirname)
  .then(function(dir) {
    return [(dir.indexOf('config.js') + 1), (dir.indexOf('config.example.js') +1)];
  })
  .then(function(configsPresent) {
    if(!configsPresent[0] && !configsPresent[1]) {
      console.log('No config or example file detected, please run \'configuro new\''.green);
      return;
    }
    else if(!configsPresent[0]) {
      console.log('No config file detected... Creating based on example file...'.green);
      return writeConfigFile(joinPath('config.js'), newFile)
    }
    else if(!configsPresent[1]) {
      console.log('No config example file detected... Creating based on config file...'.green);
      return writeConfigFile(joinPath('config.example.js'), newFile)
    }
  })
  .then(function() {
    return updateConfig();
  })
  .then(function() {
    console.log('Done'.green); 
  })
  .then(null, function(err) {
    console.log('Error:'.red, err); 
    process.exit();
  });
}

