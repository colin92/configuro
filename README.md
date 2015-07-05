# Configuro
![Built at Fullstack](https://camo.githubusercontent.com/aec51f267d906a810e0be7e4b9463f2b23bd419e/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4275696c7425323061742d46756c6c737461636b2d677265656e2e7376673f7374796c653d666c61742d737175617265)

Configuro is a command line tool that allows you to easily create and update
configuration files, and maintain seperate configurations for production and
development environments. This is geared towards node.js based projects. 

It generates a config.example.js file from your config and updates it whenever
you run `configuro update`. It also does the reverse whenever you pull down a 
more updated config example file. 


## Install

    npm install -g configuro

## Usage

To create a new config.js and corresponding config.example.js, 

    configuro new


To synchronize and update changes between your config.example.js and config.js,

    configuro update

If you know that both your files have been updated in a way that configuro cannot understand,

    configuro merge   // This opens your default 
                      // editor (using your $EDITOR environment variable)
                      // and allows you to manually merge them, you can also 
                      // do this manually if you do not have your $EDITOR set

To use the config file in your app, simply add,

    var config = require('./config.js');
    
Be sure to replace the `'./config.js'` with whatever the relative path to the file is.

**Inspired in part by the ruby gem [dotenv](https://github.com/bkeepers/dotenv) for rails**

## Author:
**Colin Meret** 
- [Blog](http://meret.io)
- [Github](http://github.com/colin92)
- [LinkedIn](http://linkedin.com/in/colinmeret)
