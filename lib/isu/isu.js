// require Modules
fs = require('fs');
var request = require('request');
var iconv 	= require('iconv-lite');
var isuJar = require('./isuJar');
var moment	= require('moment');


var login = function( usr, pass, req, res, callback) {
	"use strict";

	let j = isuJar.getJar(req);
	request({
			url: 'http://netreg.isu.edu.tw/Wapp/wap_check.asp',
			method: 'POST',
			encoding: null,
			followAllRedirects: true,
			jar: j,
			headers: {
				referer: 'http://netreg.isu.edu.tw/Wapp/wap_indexmain.asp?call_from=logout'
			},
			form: {
				logon_id: usr, 
				txtpasswd: pass
			}
		}, function (e, r, b) {

				request.get({
							url: 'http://netreg.isu.edu.tw/Wapp/left.asp',
							encoding: null,
							jar: j,
						}, 	function(ee ,rr ,bb)
							{

								let body = iconv.decode(bb, 'Big5');
								let usrName = body.match(/登出<\/font>.*?<span[^>]+>([^<]+)<\/span>/);
								
								res.cookie('name', ( usrName  == null ? '' : usrName[1]));
								res.cookie('loginMail', usr);
								res.cookie('loginPass', pass);
								res.cookie('isuAppCookie', j.getCookieString('http://netreg.isu.edu.tw') );

								if (usrName) 
									savUsrPwToDB( usr, pass, usrName[1] );
								
								callback();
							}
						);
		});
} 


// export modules
module.exports.login 		= login;