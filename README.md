# About

This is a project for Linc WMS client side.

## Preparation

* [Install NodeJS & npm](https://docs.npmjs.com/getting-started/installing-node)
* Install gulp
```
npm install gulp -g
```
* Install dependent packages
```
npm install
```
or
```
npm update
``` 

## Running
```
gulp start
```

## Access

Open the broswer with follwing URL:

```
http://localhost:8000/src/
```


### Unit Test
Use karma to run the test.
```
 npm test
```

Or
```
 npm install -g karma-cli
 karma start
```

Unit test example: test/src/demo_spec.js

#### E2E Test
Use protractor to run the test.
```
 npm install -g protractor
 webdriver-manager update
 webdriver-manager start
 protractor e2e-tests/protractor.conf.js
```
Note: Change the baseUrl to your test site in the protractor.conf.js , before run the 'protractor e2e-tests/protractor.conf.js'.


## Develop Guideline
1. Read the https://github.com/mgechev/angularjs-style-guide
2. Run the "gulp jshint" before you create pull request to master
3. Don't use the JQurey directly , use angular.element instead
4. For the theme , please refer to http://192.168.1.139/theme/admin_1_material_design/
   and https://material.angularjs.org/
   Recommend to just use the http://192.168.1.139/theme/admin_1_material_design/ css layout first. (Css style without javascript dependencies)


