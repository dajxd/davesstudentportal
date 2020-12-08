var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:" + process.env.MONGOKEY + "@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority&family=4";
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); // months are zero indexed
var yyyy = today.getFullYear();
lessondate = mm + '/' + dd + '/' + yyyy;

router.get('/', function (req, res, next) {
    function encode(str) {
        // rfc3986EncodeURIComponent was too long of a name
        return encodeURIComponent(str).replace(/[!'()*]/g, escape);
    }

    nameselection = req.query.nameselection;
    homework1 = encode(req.query.homework1);
    homework2 = encode(req.query.homework2);
    homework3 = encode(req.query.homework3);
    homework4 = encode(req.query.homework4);
    link1 = encode(req.query.link1);
    link2 = encode(req.query.link2);
    link3 = encode(req.query.link3);
    link4 = encode(req.query.link4);
    link1title = encode(req.query.link1title);
    link2title = encode(req.query.link2title);
    link3title = encode(req.query.link3title);
    link4title = encode(req.query.link4title);
    newnotes = encode(req.query.notes).replace(/[!'()*]/g, escape); // i think this is being done twice 'cause encode.
                                                                              // remove it another day
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
        const logcollection = client.db("all").collection("log");

        let namePromise = new Promise((resolve, reject) => {
            collection.find().toArray((err, results) => {
                allnames = [];
                for (i in results) {
                    allnames.push(results[i].name)
                }

                resolve(allnames);
                reject('name promise came up empty. not nice, name promise.')
            });

        });
        newlinks = {};
        newHomework = {};
        homeworks = [homework1, homework2, homework3, homework4];
        var hwc = 1
        for (hw in homeworks) {
            if (homeworks[hw].length > 1) {
                newHomework[hwc] = homeworks[hw];
                hwc = hwc + 1;
            }
        }
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
            logcollection.insertOne(
                {name: nameselection, homework: newHomework, notes: newnotes, links: newlinks, ldate: lessondate}
            )
            client.close();
            res.render('updater', {title: 'Updated'})
        });


    });
});

module.exports = router;
