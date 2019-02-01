'use strict';

var linc = linc || {};
linc.config = {
	env: 'dev',
	host: 'http://localhost:8000/dest',
	api: {
		host: ''	
	},
	contextPath: '',
	wsRtspUrl: 'ws://173.247.162.30:9090/ws',
	goEasyAppKey : 'f3150860-7ac3-47f5-9d48-2f0846b53721',
	ssoRedirectLink: 'https://devsso.logisticsteam.com/samlsso',
	isPermissionDisabled: true
};
window.linc = linc;
