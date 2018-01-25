var express = require('express');
var router = express.Router();
var http=require('http'); 
var https=require('https');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET home page. */
router.get('/from', function(req, res, next) {
  res.render('from');
});
/* GET home page. */
router.get('/wxlogin', function(req, res, next) {
	if (!(req.cookies && req.cookies.username && req.cookies.ticket)) {
		res.json({
			code: -2,
			msg: ''
		})
		return;
	}
	var headers = {
		// 'Content-Type' : 'text/plain;charset=UTF-8',
		'user-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
		'Host':'wx.qq.com',
		'Accept-Language':'zh-CN,en;q=0.8,zh;q=0.6,zh-TW;q=0.4,ja;q=0.2,id;q=0.2,ru;q=0.2',
		'Connection':'keep-alive',
		'Referer':'https://wx.qq.com/',
		'DNT':'1'
	}
	var param = req.query || req.params;
	var MSG = param.msg
	var wx2 = "";
	var myUserName = '';
	var pass_ticket = '';
	var skey = '';
	var sid = '';
	var uin = '';
	var deviceId = 'e'+Math.random().toFixed(15).substring(2,17)
	getUUID();

	function getUUID(){
	 	var hreq = https.get('https://login.wx.qq.com/jslogin?appid=wx782c26e4c19acffb&redirect_uri=https%3A%2F%2Fwx.qq.com%2Fcgi-bin%2Fmmwebwx-bin%2Fwebwxnewloginpage&fun=new&lang=zh_CN&_=1508239448402',function(ress){  
	    ress.setEncoding('utf-8');  
	    var str = '';
	    ress.on('end',function(){

	    	var regxp = new RegExp(/^""$/)
	    	var uuid = str.split('"')[1];
	    	console.log('uuid=='+uuid)
	    	var img = '<img src="https://login.weixin.qq.com/qrcode/'+uuid + '"/>'
	    	res.json({
					code: 200,
					wxImgUrl: 'https://login.weixin.qq.com/qrcode/' + uuid
				})
	    	getTicket(uuid)

	    });  
	    ress.on('data',function(chunk){
	    	str+=chunk;
	    });  
	 	});
	}
	function getTicket(uuid){
		var hreq = https.get('https://login.wx.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&uuid='+uuid+'&tip=0&r=-880061546&_='+Date.now(),function(ress){  
	    ress.setEncoding('utf-8');  
	    var str = '';
	    ress.on('end',function(){
	    	console.log('请求ticket。。。。。。');
	    	console.log(str);
	    	var code = str.split(';')[0].split('=')[1];
	    	console.log('code='+code);
	    	if(code == 200){
	    		if(str.match(/wx2.qq.com/) != null) {
		    		wx2 = "2";
		    		headers.Host = "wx2.qq.com";
		    		headers.Referer = "https://wx2.qq.com/"
		    	}
	    		var ticket = str.split('ticket=')[1].split('&uuid')[0];
	    		console.log('ticket=' + ticket);
	    		getPassTicket(ticket,uuid);
	    	}else if(code == 408 || code==201){
	    		getTicket(uuid);
	    	}else{
	    		console.log(str);
	    		console.log('超时');
	    	}
	    	
	    });  
	    ress.on('data',function(chunk){
	    	str+=chunk;
	    });  
	 	});
	}

	function getPassTicket(ticket,uuid){
		request.get({
		  url:'https://wx'+wx2+'.qq.com/cgi-bin/mmwebwx-bin/webwxnewloginpage?ticket='+ticket+'&uuid='+uuid+'&lang=zh_CN&scan='+parseInt(Date.now())+'&fun=new&version=v2&lang=zh_CN',
		}, function(error, response, body){
			console.log('请求PassTicket------->>>>>>>>');
			console.log(body);
			var str = body.toString();
			// // if (str.)
			// <ret>0</ret>
    	pass_ticket = str.split('<pass_ticket>')[1].split('</pass_ticket>')[0];
    	skey = str.split('<skey>')[1].split('</skey>')[0];
    	sid = str.split('<wxsid>')[1].split('</wxsid>')[0];
    	uin = str.split('<wxuin>')[1].split('</wxuin>')[0];
    	setCookie(response.headers['set-cookie'])
    	wxInit()
		});
	}

	function wxInit(){
		var baseRequest = {
			DeviceID:deviceId,
			Sid:sid,
			Skey:skey,
			Uin:uin
		}
		var json = {
				"BaseRequest":baseRequest
		}
		request.post({
		  headers: headers,
		  url:'https://wx'+wx2+'.qq.com/cgi-bin/mmwebwx-bin/webwxinit?r=-713029383&pass_ticket='+pass_ticket,
		  json:json
		}, function(error, response, body){
			console.log('getWxData..........');
		 	myUserName = body.User.UserName;
		  // statusNotify();
		  getAllUsers();
		});
	}

	// function statusNotify(){
	// 	var json = {
	// 		BaseRequest:{
	// 			DeviceID:deviceId,
	// 			Sid:sid,
	// 			Skey:skey,
	// 			Uin:uin
	// 		},
	// 		Code:3,
	// 		FromUserName:myUserName,
	// 		ToUserName:myUserName,
	// 		ClientMsgId:Date.now()
	// 	}
	// 	request.post({
	// 	  headers: headers,
	// 	  url:'https://wx'+wx2+'.qq.com/cgi-bin/mmwebwx-bin/webwxstatusnotify?pass_ticket='+pass_ticket,
	// 	  json:json
	// 	}, function(error, response, body){
	// 		console.log('statusNotify..........');
	// 		console.log(body)
		  
	// 	});
	// }

	function getAllUsers(){
		request.get({
			headers: headers,
		  url:'https://wx'+wx2+'.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=zh_CN&pass_ticket='+pass_ticket+'&r='+Date.now()+'&seq=0&skey='+skey
		}, function(error, response, body){
			console.log('getAllUsers..........')
			console.log(body)
		  var list = JSON.parse(body).MemberList;
		  console.log(list.length)
		  for (var i = 0; i < list.length; i++) {
		  	var member = list[i];
				console.log(member.NickName,member.UserName);
				// 群发消息要慎重
				postMsg(myUserName,member.UserName, MSG);
		  	// if(member.NickName == '北风吹雪') {
		  	 	// postMsg(myUserName,member.UserName, MSG);
		   		// break;
		  	//  }
		  }
		});
	}
	// 发送文本消息
	function postMsg(myUserName,toUserName,msg){
		var json = {
				BaseRequest:{
					DeviceID:deviceId,
					Sid:sid,
					Skey:skey,
					Uin:uin
				},
				Msg:{
					ClientMsgId:Date.now(),
					Type:1,
					LocalID:Date.now(),
					FromUserName:myUserName,
					ToUserName:toUserName,
					Content:msg
				},
				Scene:0
		}
		request.post({
		  headers: headers,
		  url:'https://wx'+wx2+'.qq.com/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=zh_CN&pass_ticket='+pass_ticket,
		  json:json
		}, function(error, response, body){
			console.log('postMsg..........')
		  console.log(body);
		});
	}

	function setCookie(cookies){
		var wxuin = cookies[0].split(';')[0];
		var wxsid = cookies[1].split(';')[0];
		var wxloadtime = cookies[2].split(';')[0];
		var webwx_data_ticket = cookies[4].split(';')[0];
		var webwxuvid = cookies[5].split(';')[0];
		var webwx_auth_ticket = cookies[6].split(';')[0];
		var last_wxuin = cookies[0].split(';')[0];
		var wxuin = cookies[0].split(';')[0];
		headers['Cookie'] = 'MM_WX_NOTIFY_STATE=1; MM_WX_SOUND_STATE=1; '+wxuin+';'+wxsid+'; '+wxloadtime+'; mm_lang=zh_CN; '+webwx_data_ticket+'; '+webwxuvid+'; '+webwx_auth_ticket+'; login_frequency=1; '+wxuin;
	}
});

module.exports = router;
