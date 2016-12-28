// Require Modules
var express = require('express');
//var proxiedRequest = request.defaults({'proxy': 'http://127.0.0.1:8888'});
var config 	= require(__dirname + '/config.json');
var logger	= require(__dirname + '/lib/logger/logger')
var bodyParser = require('body-parser');

// Require apps
var app 	= express();

// App Settings
process.env.TZ 		= 'Asia/Taipei'
app.set('port', process.env.PORT || config.port); 	//設定 PORT
app.set('views', __dirname + '/views');			  	// 設定 view 路徑及 jade 模板系統
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(logger.logger);		// 啟用記錄輸出
app.use(bodyParser());		// 啟用 body parser 以處理 post 資料

var cookieParser = require('cookie-parser')
app.use(cookieParser())

console.log('[*] 初始化完畢')

// Routers
r_main = require(__dirname + '/router/main');

app.use('/', r_main);

// Listen to port
app.listen(app.get('port'), '127.0.0.1' ,function(){
	console.log('[*] 伺服器監聽於連接埠' + app.get('port'));
});