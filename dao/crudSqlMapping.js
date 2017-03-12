var user = {
	insert:'INSERT INTO user_visit_click(user_id, user_name, age) VALUES(0,?,?)',
	update:'update user_visit_click set name=?, age=? where user_id=?',
	delete: 'delete from user_visit_click where user_id=?',
	queryById: 'select * from user_visit_click where user_id=?',
	queryAll: 'select * from mac_user'
}; 
module.exports = user;