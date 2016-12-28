var request = require('request');


var getJar = function(req) {
	"use strict";

	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.isuAppCookie
		&& (req.cookies.isuAppCookie != '') ) {
		
		req.cookies.isuAppCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://netreg.isu.edu.tw' );			
		});
	}

	return jar;
}

var getMoodleJar = function(req) {
	"use strict";
	
	let jar = request.jar();

	if (req 
		&& req.cookies 
		&& req.cookies.isuMoodleCookie
		&& (req.cookies.isuMoodleCookie != '') ) {
		
		req.cookies.isuMoodleCookie.split(';').map(function (val) { 
			jar.setCookie( request.cookie(val), 'http://moodle.isu.edu.tw' );			
		});
	}

	return jar;
}

module.exports.getJar 		= getJar;
module.exports.getMoodleJar = getMoodleJar;