var user = {
	addUser: 'INSERT INTO user(name, password) VALUES(?,?)',
	queryUser: 'select * from user where name=? and password=?',
	update:'update user_visit_click set name=?, age=? where user_id=?',
	delete: 'delete from user_visit_click where user_id=?',
	queryById: 'select * from user_visit_click where user_id=?'
	
}; 
module.exports = user;