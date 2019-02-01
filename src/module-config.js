'use strict';

define([], function() {
	return [{
		name: 'login',
		// The default tempate is 'common/template/default-main.html'. 
		templateUrl: 'login/template/login.html',
		// The default controller is 'DefaultMainPageController' which is defined in app.js.
		controller: 'LoginPageController',

	}, {
        name: 'sso',
        templateUrl:'sso/template/sso.html',
		controller: 'SsoController'
    },{
		name: 'sso-landing',
		templateUrl:'sso/template/sso-landing.html',
		controller: 'SsoLandingController'
	}, {
		name: 'home',
		templateUrl: 'home/template/home.html',
		controller: 'HomePageController' 
	}, {
		name: 'dashboard',
		iconClass: 'fa fa-tachometer',
		label: 'Dashboard',
		templateUrl: 'common/template/dashboard-main.html',
		entryUrl:'/dashboard',
		// roles: ['WAREHOUSE_SUPERVISOR']
	},{
		name: 'wms',
		iconClass: 'material-icons',
		iconText: 'local_shipping',
		label: 'Warehouse (WMS)',
		entryUrl:'/wms',
		// roles: ['WAREHOUSE_LABOR']
		// permissions: 'wms'
	}, {
		name: 'inventory',
		iconClass: 'fa fa-cubes',
		label: 'Inventory',
		entryUrl:'/inventory',
		// roles: ['WAREHOUSE_LABOR']
	}, {
		name: 'fd',
		iconClass: 'fa fa-database',
		label: 'Foundation Data',
		entryUrl:'/fd',
		// roles: ['WAREHOUSE_LABOR']
	}, {
		name: 'cf',
		iconClass: 'fa fa-database',
		label: 'Company & Facility',
		entryUrl:'/cf',
		// roles: ['WAREHOUSE_LABOR']
	}, {
		name: 'gis',
		//templateUrl : 'gis/resources/template/resources.html',
		controller: 'gis.MainPageController',
		iconClass: 'material-icons',
		iconText: 'language',
		label: 'GIS',
		entryUrl:'/gis/resources',
		// roles: ['WAREHOUSE_LABOR']
	}, {
		name: 'admin',
		iconClass: 'fa fa-cog',
		label: 'Admin',
		entryUrl:'/admin',
		// roles: ['WAREHOUSE_SUPERVISOR']
	}, {
		name: 'user',
		iconClass: 'fa fa-user',
		label: 'User',
		entryUrl:'/user',
		// roles: ['WAREHOUSE_SUPERVISOR']
	},{
		name: 'rc',
		iconClass: 'fa fa-align-justify',
		label: 'Report Center',
		entryUrl:'/rc',
		// roles: ['WAREHOUSE_SUPERVISOR']
	},{
		name: 'cl',
		iconClass: 'fa fa-align-justify',
		label: 'Conveyor Line',
		templateUrl: 'common/template/dashboard-main.html',
		entryUrl:'/cl',
		// roles: ['WAREHOUSE_SUPERVISOR']
	}];
});