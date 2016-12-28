// require Modules
var request = require('request');
var iconv 	= require('iconv-lite');
var isuJar = require('./isuJar');

var getSurveyBody = function( classCode, cmdCode, req, callback ) {
	"use strict";

	request({
			url: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130100.asp',
			method: 'POST',
			encoding: null,
			followAllRedirects: true,
			jar: isuJar.getJar(req),
			headers: {
				referer: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130100.asp'
			},
			form: {
				crcode: classCode, 
				command: cmdCode,
				submit1: '%AD%D7%A7%EF%B0%DD%A8%F7',
				surtype: 0
			}
		}, function (e, r, b) {

			let body = iconv.decode(b, 'Big5');
			callback(body);
		});
}

var pattenRadio = /name=\x22([^\x22]+)\x22 type=radio value=\x22([^\x22]+)\x22>非常同意/g
var pattenInput = /name=\x22([^\x22]+)\x22 type=input value=\x22(.*?)\x22/g
var pattenHiden = /name=([^ ]+) type=hidden value=\x22(.*?)\x22/g

var sendSurvey = function( classCode, cmdCode, req, callback) {
	"use strict";

	getSurveyBody( classCode, cmdCode, req, function(surveyBody) {
		let param = {};
		param['cr_code'] = classCode;
		param['X01X06M1/Y'] = 'Y';
		param['X01X04M1/Y'] = 'Y';
		param['X08X10M17/Y'] = 'Y';

		//期末
		param['X01X03/Y'] = 'L1';
		param['X01X07M4/Y'] = 'Y';
		param['X08X05/Y'] = 'L1';
		param['X08X06/Y'] = 'L1';
		param['X08X07/Y'] = 'L1';
		param['X08X08/Y'] = 'L1';

		param['submit1'] = '%B6%F1%A6n%B0e%A5X';

		let m;
		do {
			m = pattenRadio.exec(surveyBody);
			if (m) param[ m[1] ] = m[2];
		} while (m);
		do {
			m = pattenInput.exec(surveyBody);
			if (m) param[ m[1] ] = m[2];
		} while (m);
		do {
			m = pattenHiden.exec(surveyBody);
			if (m) param[ m[1] ] = m[2];
		} while (m);

	request({
			url: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130100.asp',
			method: 'POST',
			encoding: null,
			followAllRedirects: true,
			jar: isuJar.getJar(req),
			headers: {
				referer: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130100.asp'
			},
			form: param
		}, function (e, r, b) {
			let body = iconv.decode(b, 'Big5');
			callback(body);
		});
	});
} 


var displayAll = function( req, res, callback) {
	"use strict";

	let j = isuJar.getJar(req);
	request({
		url: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130100.asp',
		method: 'GET',
		encoding: null,
		jar: j
	}, function(e, r, b) {
		let body = iconv.decode(b, 'Big5');
		body = body.replace(/\x09/g,'').replace(/\r\n/g,'');


		if (body.indexOf('登入') > -1) {
			res.redirect('./?act=logout');
			return;
		}

		
		let patten = /<td><INPUT id=crcode[^>]+>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><td>([^<]+)<\/td><INPUT id=surtype name=surtype.{33}command.{0,100}value=\x22([^\x22]+)\x22/g;

		let classNameAll = [];
		let m;
		do {
			m = patten.exec(body);
			if (m) classNameAll.push
				([ 
					m[1],
					m[2].replace('&nbsp;',''),
					m[3].replace('&nbsp;',''),
					m[4].replace('&nbsp;',''),
					m[5]
				]);
		} while (m);

		callback(classNameAll);
	});
};


// export modules
module.exports.sendSurvey 		= sendSurvey;
module.exports.displayAll		= displayAll;