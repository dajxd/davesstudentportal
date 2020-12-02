var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:" + process.env.MONGOKEY + "@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority&family=4";


router.get('/',
    function (req, res, next) {
        if (req.cookies['user'] != undefined) {
            // read cryptoed cookie:
            var mykey = crypto.createDecipher('aes-128-cbc', process.env.CYPHER);
            var usrstr = mykey.update(req.cookies['user'], 'hex', 'utf8')
            usrstr += mykey.final('utf8');
            console.log(usrstr)
            var name = usrstr;

            MongoClient.connect(uri, function (err, client) {
                if (err) {
                    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
                }
                console.log('Connected...');
                const collection = client.db("all").collection("allstudents");
                collection.find({"name": name}).toArray((err, results) => {
                    if (results.length < 1) {
                        res.render('index', {title: 'Student Portal', error: ''});
                    } else {
                        let dname = results[0].name;
                        let displayname = dname.charAt(0).toUpperCase() + dname.slice(1);
                        res.render('users', {
                            name: displayname,
                            homework: results[0].homework,
                            notes: results[0].notes,
                            links: results[0].links
                        });
                    }
                    client.close();
                })

            })
        } else {
            res.render('index', {title: 'Student Portal', error: ''});
        }
    });

router.post('/',
    function (req, res) {
        var name = req.body.name;
        name = name.toLowerCase();
        var password = req.body.password;
        //check if me:
        if (name == process.env.ADMINU && password == process.env.ADMINP) {
                res.cookie('user', process.env.ADMINCOOKIE, {maxAge: 604800000, httpOnly: false, sameSite: 'strict'});
                res.render('linker')
        }
        else {
            MongoClient.connect(uri, function (err, client) {

                if (err) {
                    console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
                }
                console.log('Connected...');
                const collection = client.db("all").collection("allstudents");
                collection.find({"name": name}).toArray((err, results) => {
                    try {
                        if (results[0].password === password) {
                            let dname = results[0].name;
                            let displayname = dname.charAt(0).toUpperCase() + dname.slice(1);
                            if (req.cookies['user'] == undefined) {
                                var usercypher = crypto.createCipher('aes-128-cbc', process.env.CYPHER);
                                var cryptouser = usercypher.update(dname, 'utf8', 'hex')
                                cryptouser += usercypher.final('hex');

                                res.cookie('user', cryptouser, {
                                    maxAge: 604800000,
                                    httpOnly: false,
                                    sameSite: 'strict'
                                });
                            }
                            res.render('users', {
                                name: displayname,
                                homework: results[0].homework,
                                notes: results[0].notes,
                                links: results[0].links
                            });
                            client.close();
                        } else {
                            console.log('bad password for' + results[0].name);
                            res.render('index', {title: 'Student Portal', error: 'Incorrect login info.'})
                        }
                    } catch (err) {
                        console.error(err);
                        res.render('index', {title: 'Student Portal', error: 'Error, wrong username?'})
                    }
                })
            });
        }//end else
    });

module.exports = router;
