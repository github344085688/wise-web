'usr strict';

var linc = linc || {};
linc.config = {
	env: 'preview',
	host: '',
	api: {
		host: ''
	},
	contextPath: '',
	wsRtspUrl: 'wss://printer-center.logisticsteam.com:9090/ws',
	goEasyAppKey : 'f3150860-7ac3-47f5-9d48-2f0846b53721',
	ssoRedirectLink: 'https://previewsso.logisticsteam.com/samlsso',
	isPermissionDisabled: false
};

window.linc = linc;