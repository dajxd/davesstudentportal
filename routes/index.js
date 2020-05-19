var express = require('express');
var router = express.Router();


// passport.use(new Strategy(
//     function(username, password, cb) {
//         db.users.findByUsername(username, function(err, user) {
//             if (err) { return cb(err); }
//             if (!user) { return cb(null, false); }
//             if (user.password != password) { return cb(null, false); }
//             return cb(null, user);
//         });
//     }));

/* GET home page. */
router.get('/', function (req, res, next) {


    res.render('index', {title: 'Student Portal', error: ''});
});

module.exports = router;
