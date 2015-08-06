
exports.browser1='chrome';
exports.sauce1=true;
exports.version1='30';
exports.platform1='Windows 7';
exports.portnum1=4444;
exports.bamboodomain='${bamboo.cqAuthorHost}';
if((!exports.bamboodomain || !exports.bamboodomain.length)){
	exports.domain='http://cmspubdev.acs.org';
}else{
	exports.domain=exports.bamboodomain;
}

exports.domain_local='http://localhost:4502';
exports.domain_author='http://cmsautdev.acs.org';
exports.domain_publish='http://cmspubdev.acs.org';
exports.username='admin';
//exports.password='admin';
exports.password='cq<>acs.org';
