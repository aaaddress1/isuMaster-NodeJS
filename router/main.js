// require Modules
var isu 	= require('../lib/isu/isu');
var survey 	= require('../lib/isu/survey');
var isuClass = require('../lib/isu/isuClass');
var moodle = require('../lib/isu/isuMoodle');
var moment = require('moment');
var express = require('express');
var router 	= express.Router();

// Routers
router.route('/getAbsenteeism')
	.get(function(req, res){

		res.set({ 'content-type': 'application/json; charset=utf-8' });
		
		isuClass.displyNowAbsenteeism( req, res, function(absenceArr, vacationArr){
			res.end( JSON.stringify({absenceArr, vacationArr},null,10) );
		} );

	});

router.route('/getTodayClasses')
	.get(function(req, res){
		isuClass.displayDay( req, res, function( today, list, tommow, tommowList, error ) {
				res.set({ 'content-type': 'application/json; charset=utf-8' });
				res.end( JSON.stringify({today,list,tommow,tommowList,error:error},null,10) );
			});
		});

router.route('/getTodayMoodle')
	.get(function(req,res) {
		moodle.displyNowClass(req, res, function( alivArr, deadArr, infoArr, quizArr, totalClassArr, error ) {
			res.set({ 'content-type': 'application/json; charset=utf-8' });
			res.end( JSON.stringify({alivArr, deadArr, infoArr, quizArr, totalClassArr, error:error},null,10) );
		
		});
	});

router.route('/about')
	.get(function(req, res){
		res.end('<head><meta charset="UTF-8"></head>安安！尼好！<br>我是作者馬聖豪！由於我現在懶得寫這頁所以很粗略隨便寫了下這頁<br>我也是義守學生 & 這支網站採 node.js 撰寫 <br>如果遇到任何問題可發信至 aaaaddress1@gmail.com 給我唷 O_<')	
	});

router.route('/isuSurvey')
	.get(function(req, res){
		survey.displayAll(req, res, function(classNameAll) {
			"use strict";
			let NewMessage = ''

			res.render('survey.jade', {
				list: classNameAll,
				usrName: req.cookies.name,
				NewMessage: NewMessage
			});
		});
	});

router.route('/isuSurvey')
	.post(function(req, res) {
		"use strict";
		let NewMessage = '';
		let sucessed = false;

		survey.sendSurvey( req.body.classId, req.body.cmd, req, function(sendSurveyRes) {

			if ( sendSurveyRes.indexOf('您可填寫的課程意見評量表') > -1 ) {
				NewMessage = req.body.className + ' 填寫成功';
				sucessed = true;
			}
			else {
				NewMessage = req.body.className + ' 填寫失敗O_Q...';
				sucessed = false;
			}
			res.set({ 'content-type': 'application/json; charset=utf-8' });
			res.end( JSON.stringify({NewMessage,sucessed},null,10) );
		});
	});

router.route('/isuMoodle')
	.get(function(req, res) {
		
		if ( req.cookies && req.cookies.isuMoodleCookie && (req.cookies.isuMoodleCookie != '')){
			res.render('moodle.jade',{	usrName: req.cookies.name,
										moodleUsr: req.cookies.loginMail,
										moodlePass: req.cookies.loginPass });			
		}
		else {

			moodle.login( req, res, req.cookies.loginMail, req.cookies.loginPass, function(s) {
				if (s)
					res.redirect('/isuMoodle');
				else
					res.redirect('./?act=logout');
					//res.end('機器人嘗試以' + req.cookies.loginMail + ' 身份登入 Moodle 系統失敗了！');
			});
		}
		
		//
	});

router.route('/')
	.get(function(req, res){

		if ( req.query.act == 'logout' ) {
			res.cookie('name','');
			res.cookie('isuAppCookie', '' );
			res.cookie('isuMoodleCookie', '' );
			res.redirect('/?act=nope');	
		}
		else if ( req.query.act == 'login' ) {
			
			if ( req.cookies && (req.cookies.name  != '') ) {
				res.redirect('./');
			}
			else 
				res.render('login.jade', { defaultUsr:'', defaultPass: '', errorMsg: '登入失敗, 帳號密碼不正確?' });
		}
		else {

			if ( req.cookies && req.cookies.name && (req.cookies.name  != '') ) 
				res.render('mainPage.jade', { usrName: req.cookies.name });		
			
			else {
		
				if (req.cookies.loginMail && req.cookies.loginPass )
					res.render('login.jade', {	defaultUsr:req.cookies.loginMail,
												defaultPass:req.cookies.loginPass });
				else
					res.render('login.jade', { defaultUsr:'', defaultPass: '' });
			}
			
		}
	});

router.route('/')
	.post(function(req, res) {
		isu.login( req.body.usrId, req.body.usrPass, req, res, function(){
			res.redirect('./?act=login');
		});
	});

// export module
module.exports = router;