var UserModel  = require('../../models').User;
var eventproxy = require('eventproxy');
var validator  = require('validator');
var jwt = require('jsonwebtoken')
var cache        = require('../../common/cache')

// 非登录用户直接屏蔽
var auth = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  var accessToken = req.headers.authorization.replace(/Bearer[ ]*/g, '')
  
  if (!accessToken) {
    res.status(401)
    return res.send({success: false, error_msg: '验证过期'})
  } else {
    var sessionKey = jwt.verify(accessToken, 'ZHGJ-LITE-holyshit')
    sessionKey = sessionKey.sessionKey
    cache.get(`sessionKey:${sessionKey}`, ep.done(function (data) {

      if(!data.active){
        res.send({
          code: 9000,
          success: false,
          message: 'user is not exist'
        })
      }else {
        UserModel.findOne({_id: data._id}, ep.done(function(user) {
          req.user = user
          next()
        }))
      }
    }))
    
  }
  
  // var accessToken = String(req.body.accesstoken || req.query.accesstoken || '');
  // accessToken = validator.trim(accessToken);

  // UserModel.findOne({accessToken: accessToken}, ep.done(function (user) {
  //   if (!user) {
  //     res.status(401);
  //     return res.send({success: false, error_msg: '错误的accessToken'});
  //   }
  //   if (user.is_block) {
  //     res.status(403);
  //     return res.send({success: false, error_msg: '您的账户被禁用'});
  //   }
  //   req.user = user;
  //   next();
  // }));


  
};

exports.auth = auth;

// 非登录用户也可通过
var tryAuth = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  var sessionKey = req.headers.sessionkey
  if (!sessionKey) {
    return next()
  } else {
    cache.get(`sessionKey:${sessionKey}`, ep.done(function(data) {
      UserModel.findOne({_id: data._id}, ep.done(function(user){
        console.log(user)
        req.user = user
        next()
      }))
    }))
  }
  
  
  // var accessToken = String(req.body.accesstoken || req.query.accesstoken || '');
  // accessToken = validator.trim(accessToken);

  // UserModel.findOne({accessToken: accessToken}, ep.done(function (user) {
  //   if (!user) {
  //     return next()
  //   }
  //   if (user.is_block) {
  //     res.status(403);
  //     return res.send({success: false, error_msg: '您的账户被禁用'});
  //   }
  //   req.user = user;
  //   next();
  // }));

};

exports.tryAuth = tryAuth;
