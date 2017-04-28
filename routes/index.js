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


router.get('/reg', isLogin);
//用户进入注册页面
router.get('/reg',function(req,res){
    res.render('reg',{title:"register"});
});
router.post('/reg', isLogin);
//用户点击注册按钮
router.post('/reg',function(req,res){
   if(req.body['password']!= req.body['passwordconf']){
       req.session.error="两次密码不一致";
       return res.redirect('/reg');
   }
    var md5=crypto.createHash('md5');
    var password=md5.update(req.body.password).digest('base64');
    /*var newUser=new User({
        name:req.body['username'],
        password:password
    });*/
    db.query("select * from `user` where `name`='"+req.body['username']+"'",function(err,user){
        if(user[0]){
            err="username already exist";
        }
        if(err){
           req.session.error=err;
           return  res.redirect('/reg');
        }
        var sql = "insert into `user`(name,password) value(?,?)";
        var value = [req.body['username'],password];
        console.log(value);
        db.query(sql,value,function(err){
            if(err){
                req.session.error=err.message;
                return  res.redirect('/reg');
            }
            db.query("select * from `user` where `name`='"+req.body['username']+"'",function(err,user){
                req.session.user=user[0];
                req.session.success="register success";
                res.redirect('/');
            });
        });
    });
});

router.get('/add', isLogin);

router.get('/add',function(req,res){
    res.render('add',{title:"add"});
});
router.post('/add', isLogin);
//用户点击注册按钮
router.post('/add',function(req,res){
    var sql = "insert into `user`(name,phone,address,user_id) value(?,?,?,?)";
    var value = [req.body['name'],req.body['phone'],req.body['address'],req.session.id];
    console.log(value);
    db.query(sql,value,function(err){
        if(err){
            req.session.error=err.message;
            return  res.redirect('/add');
        }
        res.redirect('/');
    });
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
        console.log(req.session.user);
        if(req.body.sub == "add"){
            next();
        }
        req.session.message="用户已登录";
        return res.redirect('/');
    }
    console.log(res);return;
    return res.redirect('/login');
}

router.get('/logout',function(req,res){
    req.session.user=null;
	req.session.contact=null;
    res.redirect('/');
});

module.exports = router;
