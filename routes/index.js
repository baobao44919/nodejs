var express = require('express');
var db = require('../db');
var crypto = require('crypto');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.user){
		var sql = "select * from `address` where `user_id`='"+req.session.user['id']+"'"
		return db.query(sql,function(err,contact){
            var result = contact;
            res.render('index', {contact : result} );
        });
    }
	res.render('index', { title: 'manageaddress' });
});

router.get('/reg', function(req, res, next) {
  res.render('reg', { title: 'manageaddress' });
});

router.get('/login',isLogin);
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'manageaddress' });
});

router.post('/login',isLogin);
router.post('/login',function(req,res){
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('base64');
	req.session.password = password;
	var sql = "select * from `user` where name ='"+req.body.username+"'";
    db.query(sql,function(err,user){
        if(!user){
            req.session.error="用户不存在";
            return res.redirect('/login');
        }
        if(user[0].password!=password){
            req.session.error="密码错误";
            return  res.redirect('/login');
        }
            req.session.user=user[0];
            req.session.success="登录成功";
            res.redirect('/');
    });
});

function isLogin(req,res,next){
    if(req.session.user){
        req.session.message="用户已登录";
        return res.redirect('/');
    }
    next();
}

router.get('/logout',function(req,res){
    req.session.user=null;
	req.session.contact=null;
    res.redirect('/');
});

module.exports = router;
