// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./crudSqlMapping');
 
// 使用连接池，提升性能
var pool  = mysql.createPool($util.extend({}, $conf.mysql));

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};
var setCookies = function (res, param) {
	res.cookie('code', param.code, {})
}
module.exports = {
	register: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			// 获取前台页面传过来的参数
			var param = req.query || req.params;
 
			// 建立连接，向表中插入值
			connection.query($sql.addUser, [param.name, param.password], function(err, result) {
				if(result) {
					result = {
						code: 200,
						msg:'增加成功'
					};
					setCookies(res, param)
				}
				console.log(err, result)
				// 以json形式，把操作结果返回给前台页面
				res.redirect('/index.html');
				// 释放连接 
				connection.release();
			});
		});
	},
	login:function (req, res, next) {
		pool.getConnection(function(err, connection) {
			// 获取前台页面传过来的参数
			var param = req.query || req.params;
 
			// 建立连接，向表中插入值
			connection.query($sql.queryCode, [param.code], function(err, result) {
				if(result.length) {
					result = {
						code: 200,
						msg:'登录成功'
					};
					setCookies(res, param)
					res.redirect('/index.html');
				} else {
					result = {
						code: -2,
						msg:'登录失败，激活码无效'
					};
					res.redirect('/login.html?error=1');
				}
				
				// 释放连接 
				connection.release();
			});
		});
	},
	// 生成新的激活码
	addCode:function (req, res, next) {
		var str = Date.now().toString();
		var code = parseInt(Math.random() * 10) + str.split("").reverse().join("") + parseInt(Math.random() * 10);
		pool.getConnection(function(err, connection) {
			// 建立连接，向表中插入值
			connection.query($sql.addCode, [code], function(err, result) {
				console.log('result', result)
				if(result.affectedRows) {
					res.json({
						code: 200,
						msg: code
					})
				} else {
					res.json({
						code: 200,
						msg: '获取 code 失败，请重试'
					})
				}
				// 释放连接 
				connection.release();
			});
		});
	},
	delete: function (req, res, next) {
		// delete by Id
		pool.getConnection(function(err, connection) {
			var id = +req.query.id;
			connection.query($sql.delete, id, function(err, result) {
				if(result.affectedRows > 0) {
					result = {
						code: 200,
						msg:'删除成功'
					};
				} else {
					result = void 0;
				}
				jsonWrite(res, result);
				connection.release();
			});
		});
	},
	addCount: function (code) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.addCount, [code], function(err, result) {
				console.log(result)
				if(result.affectedRows > 0) {
					console.log(code + '次数加一')
				} else {
					console.log(code + '次数加一失败')
				}
				connection.release();
			});
		});
	},
	queryAll: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			//console.log(err);
			connection.query($sql.queryAll, function(err, result) {
				jsonWrite(res, result);
				connection.release();
			});
		});
	}
}
