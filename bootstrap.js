require.config({
    baseUrl: './',
    paths: {
        'angular-ui-router': 'assets/angular-ui-router/release/angular-ui-router.min',
        'angular-async-loader': 'assets/angular-async-loader/angular-async-loader.min',
        'angular-ui-mask': 'assets/angular-ui-mask/dist/mask.min',
        'ng-tags-input': 'assets/ng-tags-input/build/ng-tags-input.min',
        'angular-css': 'assets/angular-css/angular-css',
        'angular-file-upload': 'assets/angular-file-upload/angular-file-upload'
    },
    shim: {
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']}
    }
});

require(['angular', './app-routes'], function (angular) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        angular.element(document).find('html').addClass('ng-app');
    });
});

