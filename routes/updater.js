var express = require('express');
var router = express.Router();
var userlist = ['mia', 'katie', 'rafael', 'marina'];
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://davem:ClickUpper1@studentdata-8hxes.gcp.mongodb.net/test?retryWrites=true&w=majority";


router.get('/', function (req, res, next) {
    let nameselection = req.query.nameselection;
    let homework1 = encodeURIComponent(req.query.homework1);
    let homework2 = encodeURIComponent(req.query.homework2);
    let homework3 = encodeURIComponent(req.query.homework3);
    let homework4 = encodeURIComponent(req.query.homework4);
    let link1 = encodeURIComponent(req.query.link1);
    let link2 = encodeURIComponent(req.query.link2);
    let link3 = encodeURIComponent(req.query.link3);
    let link4 = encodeURIComponent(req.query.link4);
    let link1title = encodeURIComponent(req.query.link1title);
    let link2title = encodeURIComponent(req.query.link2title);
    let link3title = encodeURIComponent(req.query.link3title);
    let link4title = encodeURIComponent(req.query.link4title);
    let newnotes = encodeURIComponent(req.query.notes);


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
        // link1title = req.query.link1title;
        // link2title = req.query.link2title;
        // link3title = req.query.link3title;
        // link4title = req.query.link4title;
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
