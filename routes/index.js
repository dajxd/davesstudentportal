var express = require('express');
var router = express.Router();

router.get('/',
    function (req, res, next) {
        res.render('index', {title: 'Student Portal', error: ''});
    });
router.post('/',
    function (req, res) {
        var name = req.body.name;
        name = name.toLowerCase();
        if (name == "dave") {
            res.render('index', {title: 'Imposter!', error: '...'})
        }
        var password = req.body.password;
        MongoClient.connect(uri, function (err, client) {
            if (err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
            }
            console.log('Connected...');
            const collection = client.db("all").collection("allstudents");
            collection.find({"name": name}).toArray((err, results) => {
                try {
                    if (results[0].password === password) {
                        console.log('good password for' + results[0].name);
                        let dname = results[0].name;
                        let displayname = dname.charAt(0).toUpperCase() + dname.slice(1);

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
                    res.render('index', {title: 'Student Portal', error: 'Not a registered student.'})
                }
            })
        });
    });

module.exports = router;
