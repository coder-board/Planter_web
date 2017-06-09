define(function (require, exports, module) {
    var angular = require('angular');
    var asyncLoader = require('angular-async-loader');
    var angularFileUpload = require('angular-file-upload');
    var angularCSS = require('angular-css');
    require('angular-ui-router');

    var app = angular.module('app', ['ui.router','angularFileUpload','angularCSS']);

    asyncLoader.configure(app);

    module.exports = app;
});
