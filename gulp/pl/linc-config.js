'usr strict';

var linc = linc || {};
linc.config = {
	env: 'prod',
	host: '',
	api: {
		host: ''
	},
	contextPath: '/pl',
	wsRtspUrl: 'wss://printer-center.logisticsteam.com:9090/ws',
	goEasyAppKey : 'f3150860-7ac3-47f5-9d48-2f0846b53721',
	ssoRedirectLink: 'https://plsso.logisticsteam.com/samlsso',
	isPermissionDisabled: false
};

window.linc = linc;