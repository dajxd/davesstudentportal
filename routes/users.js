var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:ClickUpper1@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority&family=4";

router.get('/', function (req, res, next) {

    MongoClient.connect(uri, function (err, client) {
        console.log('connecting');
        if (err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
        }
        console.log('Connected...');
        const collection = client.db("all").collection("allstudents");

        var sid = req.query.name;

        var qname = sid.toLowerCase();
        console.log('finding');
        collection.find({"name": qname}).toArray((err, results) => {
            if (err) {
                console.log(err);
                process.exit(0);
            }
            try {
                let dname = results[0].name;
                let displayname = dname.charAt(0).toUpperCase() + dname.slice(1);
                res.render('users', {
                    name: displayname,
                    homework: results[0].homework,
                    notes: results[0].notes,
                    links: results[0].links
                });
            }
            catch(error){
                console.error(error);
                res.render('index', {title: 'Dave\'s Student Portal', error: 'Not a registered student.'})
            }

        });
        client.close();
        console.log('closed db')
    });
});

module.exports = router;
