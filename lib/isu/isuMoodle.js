var request = require('request');
var iconv 	= require('iconv-lite');
var cheerio = require('cheerio');
var moment	= require('moment');
var isuJar = require('./isuJar');

var login = function( req, res, usr, pass, callback) {
	"use strict";

	let j = isuJar.getMoodleJar(req);

	request({
			url: 'http://moodle.isu.edu.tw/login/index.php',
			method: 'POST',
			encoding: 'utf-8',
			followAllRedirects: true,
			jar: j,
			form: {
				username: usr, 
				password: pass
			}
		}, function (e, r, b) {

			let sucessed = /logout.php.*?登出/.test(b);
			if (sucessed)
				res.cookie('isuMoodleCookie', j.getCookieString('http://moodle.isu.edu.tw') );
			else
				res.cookie('isuMoodleCookie', '' );
			callback(sucessed);

		});
} 

var analyzerMoodle = function( source , callback ) {
	"use strict";

	let hwAliveArr = [], hwDeadArr = [], hwInfoArr = [], quizArr = [], totalClassArr = [];
	let today = moment().startOf('day');

    let $ = cheerio.load(source);

    $("div[class='box coursebox']").each(function(i, elemi) {

    	let className = $(elemi).find(".title").text().split('_')[1];
    	let classLink = $(elemi).find("a").attr('href');
    	let classActivity = $(elemi).find(".activity_info");

    	totalClassArr.push([className, classLink]);

    	if (classActivity != '') {

  			classActivity.find("div[class='assign overview']").each( function(j, elemj) {
  				let hwName = $(elemj).find("a").text();
  				let hwInfo = $(elemj).find(".info").text();
  				let hwLink = $(elemj).find("a").attr('href');
  				let hwDetl = $(elemj).find(".details").text();

				let m = moment(hwInfo,'YYYYMMDD');  
				let days = Math.round(moment.duration(m - today).asDays());
  				
  				if (days >= 0) {
  					hwAliveArr.push([className,hwName,days + ' 天',hwDetl,hwDetl,hwLink]);
  				}
				else {
					hwDeadArr.push([className,hwName,-days + ' 天',hwDetl,hwInfo,hwLink]);

				}

  			});

  			classActivity.find("div[class='overview forum']").each( function(j, elemj) {
  				let alertName = $(elemj).find("a").text();
  				let alertInfo = $(elemj).find(".info").text();
  				let alertLink = $(elemj).find("a").attr('href');
  				hwInfoArr.push([className,alertName,alertInfo,alertLink]);
  			});

  			classActivity.find("div[class='quiz overview']").each( function(j, elemj) {
  				
  				let quizName = $(elemj).find("a").text();
  				let quizInfo = $(elemj).find(".info").text();
  				let quizLink = $(elemj).find("a").attr('href');

  				let m = moment(quizInfo,'YYYYMMDD');  
				let days = Math.round(moment.duration(m - today).asDays());

  				if (days >= 0) {
  					quizArr.push([className,quizName, days + ' 天',quizInfo,quizLink]);
  				} else {
  					quizArr.push([className,quizName, '已過期 ' + (-days) + ' 天',quizInfo,quizLink]);
  				}
  				
  			});
  		}
	});
	callback( hwAliveArr, hwDeadArr, hwInfoArr, quizArr, totalClassArr, false );
}


var displyNowClass = function( req, res, callback ) {
	"use strict";

	let j = isuJar.getMoodleJar(req);
	request.get({
				url: 'http://moodle.isu.edu.tw/my/index.php?mynumber=0',
				encoding: 'utf-8',
				jar: j,
			}, 	function(e ,r ,b) {
					if (!(/logout.php.*?登出/.test(b))) {

						callback( null, null, null, null, null, true );
						return;
						//res.cookie('isuMoodleCookie', '' );
						//res.redirect('/isuMoodle');
					}
					analyzerMoodle( b, callback );
					
				}
			);
}

module.exports.login 		= login;
module.exports.displyNowClass = displyNowClass;
