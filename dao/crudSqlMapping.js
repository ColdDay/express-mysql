var user = {
	addUser: 'INSERT INTO user(name, password) VALUES(?,?)',
	queryCode: 'select * from active_code where code=?',
	// 发送次数加一
	addCount: 'update active_code set postCount=postCount+1 where code=?',
	//添加一个激活码
	addCode: 'INSERT INTO active_code(code) VALUES(?)',
	update:'update user_visit_click set name=?, age=? where user_id=?',
	delete: 'delete from user_visit_click where user_id=?',
	queryById: 'select * from user_visit_click where user_id=?'
	
}; 
module.exports = user;