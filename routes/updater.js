var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:"+process.env.MONGOKEY+"@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority&family=4";


router.get('/', function (req, res, next) {
    function rfc3986EncodeURIComponent (str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, escape);
    }
    nameselection = req.query.nameselection;
    homework1 = rfc3986EncodeURIComponent(req.query.homework1);
    homework2 = rfc3986EncodeURIComponent(req.query.homework2);
    homework3 = rfc3986EncodeURIComponent(req.query.homework3);
    homework4 = rfc3986EncodeURIComponent(req.query.homework4);
    link1 = rfc3986EncodeURIComponent(req.query.link1);
    link2 = rfc3986EncodeURIComponent(req.query.link2);
    link3 = rfc3986EncodeURIComponent(req.query.link3);
    link4 = rfc3986EncodeURIComponent(req.query.link4);
    link1title = rfc3986EncodeURIComponent(req.query.link1title);
    link2title = rfc3986EncodeURIComponent(req.query.link2title);
    link3title = rfc3986EncodeURIComponent(req.query.link3title);
    link4title = rfc3986EncodeURIComponent(req.query.link4title);
    newnotes = rfc3986EncodeURIComponent(req.query.notes).replace(/[!'()*]/g, escape);
    console.log(decodeURIComponent(newnotes));

    if (req.query.newname != undefined) {
        var newname = req.query.newname
        nameselection = newname.toLowerCase()
    }


    MongoClient.connect(uri, function (err, client) {
        if (err) {
            console.log('Error occurred while connecting to MongoDB Atlas...\n', err);
        }
        console.log('Connected...');
        const collection = client.db("all").collection("allstudents");

        let namePromise = new Promise((resolve, reject) => {
            collection.find().toArray((err, results) => {
                allnames = [];
                for (i in results) {
                    allnames.push(results[i].name)
                }

                resolve(allnames);
                reject('name promise came up empty')
            });

        });
        newlinks = {};
        newHomework = {1: homework1, 2: homework2, 3: homework3, 4: homework4};
        link1title = req.query.link1title;
        link2title = req.query.link2title;
        link3title = req.query.link3title;
        link4title = req.query.link4title;
        newlinks[link1title] = link1;
        newlinks[link2title] = link2;
        newlinks[link3title] = link3;
        newlinks[link4title] = link4;


        namePromise.then((allnames) => {
            if (allnames.includes(nameselection)) {
                collection.updateOne(
                    {name: nameselection},
                    {
                        $set: {
                            homework: newHomework,
                            notes: newnotes,
                            links: newlinks
                        }
                    }
                );
            } else {
                collection.insertOne(
                    {name: nameselection, homework: newHomework, notes: newnotes, links: newlinks}
                )
            }
            client.close();
            res.render('updater', {title: 'Updated'})
        });


    });
});

module.exports = router;
