/****************************************************
Universal Logger - Main

Auther:			Lorex
Version: 		v1.0
Last Update: 	2015/12/30

Sitatech Information Services Corp. All right reserved.

*****************************************************/


# Requires
require! 'morgan'
require! 'dateformat'
require! 'fs'
require! './data' : data

format = '[:date] :visitor 網址：:url 狀態：:status 回應時間：:response-time ms'
path = './data.json'

# Tokens
morgan.token 'visitor', (req, res) -> 
	data.count++
	write ={ count: data.count }
	fs.writeFile path, (JSON.stringify write, null, 4), (err) ->
		if err
			console.log '[*] 錯誤！無法寫入 json'
	data.count

# Logger
logger = morgan format, {
	skip: (req, res) -> res.statusCode ~= 404
}


# Exports
exports.logger = logger;