var request = require('request');
var iconv 	= require('iconv-lite');
var isuJar = require('./isuJar');
var cheerio = require('cheerio');
var getIndexOfToday = function( addOffset ) {
	"use strict";

	let date = new Date();
	let retn = date.getDay();
	retn = (retn+addOffset) % 7;
	return (retn == 0 ? 7 : retn);
}

var getDetailClassRoom = function( classRoomID ) {
	if (classRoomID.startsWith('01'))
		return '行政大樓 ' + classRoomID.slice(-3);
	else if (classRoomID.startsWith('02'))
		return '理工大樓 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('03'))
		return '科技大樓 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('5'))
		return '綜合大樓 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('6'))
		return '國際學院 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('A'))
		return '燕巢校區 A 棟 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('B'))
		return '燕巢校區 B 棟 ' + classRoomID.slice(-3); 
	else if (classRoomID.startsWith('C'))
		return '燕巢校區 C 棟 ' + classRoomID.slice(-3); 

	return classRoomID;
}

/**
*	Body: Isu class html source
*	Index: Mon = 1, Tue = 2, Wed = 3, ..., Sat = 6, Sun = 7
*/
var getClassOfDayByIndex = function( body , index ) {
	"use strict";

	let timeArr = ['08:20', '09:20', '10:20', '11:20', '13:30', '14:30', '15:30', '16:30', '17:30', '18:50', '19:40', '20:30', '21:20'];
	let classListArr = [];

	body = body.replace(/\n/gi,'').replace(/\r/gi,'').replace(/\t/gi,'');
	let $ = cheerio.load(body);

	$("tr[onmouseover='this.style.backgroundColor=\'yellow\';this.style.cursor=\'hand\';']").each(
		function(i, elemi) {

	        let childArr = $(elemi).find('td');
	        let classID = $(childArr[0]).text();
	        let className = $(childArr[1]).text().split('\x20')[0].replace(/[\x20\xa0]/g,'');
	        let classGrade = $(childArr[2]).text();
	        let classElective = $(childArr[5]).text().replace(/[\x20\xa0]/g,'');
	        let classTeacher = $(childArr[6]).text().replace(/[\x20\xa0]/g,'');
	        let classRoomID = $(childArr[7]).text().replace(/\x20/g,'');
	        let extraMessage = $(childArr[16]).text();
			let classTimeSequence = $(childArr[(7+index)]).text();

			if (classTimeSequence != '\xA0') {
				classTimeSequence = classTimeSequence.replace(/\xa0/g,'');

				for(let j in classTimeSequence) {
					let p = -1;
					if (/^\d+$/.test(classTimeSequence[j]))
						p = parseInt(classTimeSequence[j]);
					
					classListArr.push([	p < 0 ? '' :timeArr[p-1],
										classElective,
										classTeacher,
										classGrade,
										className,
										getDetailClassRoom(classRoomID)
					]);			
				}
				
			}
			
	});
	return classListArr;
}


var displayDay = function( req, res, callback ) {
	"use strict";

	let j = isuJar.getJar(req);
	request.get({
				url: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130430.asp',
				encoding: null,
				jar: j,
			}, 	function(e ,r ,b) {

					let body = iconv.decode(b, 'Big5');

					if (body.indexOf('登入') > -1) {
						callback( null, null, null, null, true );
						return;
					}

					let arr = ['一','二','三','四','五','六','日'];
					let currDay = getIndexOfToday(0);
					let tommDay = getIndexOfToday(1);
					callback(	arr[currDay-1],
								getClassOfDayByIndex( body, currDay ),
								arr[tommDay-1],
								getClassOfDayByIndex( body, tommDay ),
								false );
				
				});

};


var displyNowAbsenteeism = function( req, res, callback ) {
	"use strict";

	let vacationArr = [];
	let absenceArr = [];
	let j = isuJar.getJar(req);

	request.get(
	{
		url: 'http://netreg.isu.edu.tw/wapp/wap_13/wap_130040.asp',
		encoding: null,
		jar: j,
	},
	function(e, r, b)
	{
		let body = iconv.decode(b, 'Big5');
		if (body.indexOf('登入') > -1) {
			callback(null, null);
			return;
		}
		

		let $ = cheerio.load(body);
		/* absence */
		$($("table")[1]).find("tr[align='middle']").each(function(i,elem)
		{
			let itemArr = $(elem).find('td');

			let classId = $(itemArr[0]).text();
			let className = $(itemArr[1]).text().replace(/[\r\n\t ]/g,'');
			let date = $(itemArr[2]).text().replace(/[\r\n\t ]/g,'');
			let classTime = $(itemArr[3]).text();
			absenceArr.push(
			[
				classId,
				className,
				date,
				classTime
			]);
		});

		/* vacation */
		$($("table")[2]).find("tr[align='middle']").each(function(i,elem)
		{
			let itemArr = $(elem).find('td');

			let classId = $(itemArr[0]).text();
			let className = $(itemArr[1]).text().replace(/[\r\n\t ]/g,'');
			let date = $(itemArr[2]).text().replace(/[\r\n\t ]/g,'');
			let classTime = $(itemArr[3]).text();
			let classType = $(itemArr[4]).text();
			vacationArr.push(
			[
				classId,
				className,
				date,
				classTime,
				classType
			]);
		});
		callback(absenceArr, vacationArr);
		return;
	});
}



// export modules
module.exports.displayDay 	= displayDay;
module.exports.displyNowAbsenteeism = displyNowAbsenteeism;
