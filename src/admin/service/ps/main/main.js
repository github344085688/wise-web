'use strict';

define([
    'angular',
    'src/admin/service/ps/template/template',
    'src/admin/service/ps/printer/printer',
    'src/admin/service/ps/server/server',
    'src/admin/service/ps/module-template/moduleTemplate',
    'src/admin/service/ps/label-template/labelTemplate',
    'src/admin/service/ps/template-field-config/templateFieldConfig',
    'src/admin/service/ps/template-field-config/templateFieldConfig'
], function (angular, controller) {
    angular.module('linc.admin.service.ps', ['linc.admin.service.ps.template', 'linc.admin.service.ps.printer',
        'linc.admin.service.ps.server', 'linc.admin.service.ps.moduleTemplate', 'linc.admin.service.ps.labelTemplate',
        'linc.admin.service.ps.templateFieldConfig'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('admin.service.ps.template', {
                url: '/template',
                templateUrl: 'admin/service/ps/template/template/template.html',
                controller: 'TemplatePageController',
                    data: {
                        title: "Template Management",
                        permissions: "service::print_read"
                    }
                })
                .state('admin.service.ps.printer', {
                    url: '/printer',
                    templateUrl: 'admin/service/ps/printer/template/printer.html',
                    controller: 'PrinterPageController',
                    data: {
                        title: "Printer Management",
                        permissions: "service::print_read"
                    }
                })
                .state('admin.service.ps.server', {
                    url: '/server',
                    templateUrl: 'admin/service/ps/server/template/server.html',
                    controller: 'ServerPageController',
                    data: {
                        title: "Server Management",
                        permissions: "service::print_read"
                    }
                })
                .state('admin.service.ps.moduleTemplate', {
                    url: '/module-template',
                    templateUrl: 'admin/service/ps/module-template/template/moduleTemplate.html',
                    controller: 'ModuleTemplateController',
                    data: {
                        title: "Module Template Management",
                        permissions: "service::print_read"
                    }
                })
                .state('admin.service.ps.labelTemplate', {
                    url: '/label-template',
                    templateUrl: 'admin/service/ps/label-template/template/labelTemplate.html',
                    controller: 'LabelTemplateController',
                    data: {
                        title: "Label Template Management",
                        permissions: "service::print_read"
                    }
                })
                .state('admin.service.ps.templateFieldConfig', {
                    url: '/template-field-config',
                    templateUrl: 'admin/service/ps/template-field-config/template/templateFieldConfig.html',
                    controller: 'TemplateFieldConfigController',
                    data: {
                        title: "Template Field Config",
                        permissions: "service::print_read"
                    }
                });
        }]);
});
