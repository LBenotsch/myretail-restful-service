const express = require('express');
const request = require('request');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const app = express();
const port = process.env.PORT || 8080;

//GET homepage
app.get('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send("You have reached the myRetail RESTful Service");
    console.log("/ GET - Homepage hit")
});

//GET product data by ID (ex. use id's 13860428, 13860420, 13860421, 13860422)
app.get('/products/:id', function (req, res) {
    //Store initial ID
    var id = req.params.id;

    //Check for valid ID
    if (!isNaN(id)) {
        //Store valid ID
        id = parseInt(req.params.id);
        console.log("/ GET - Product Search - ID:" + id);
    } else {
        console.log("Invalid ID was searched");
        res.status(400);
        res.json({
            "product": {
                "item": {
                    "error_message": "Invalid ID",
                    "status_code": 400
                }
            }
        });
        return;
    }

    //Get target json by ID
    function getTargetProductJsonByID(callback) {
        //Dynamic target url
        var targetUrl = "https://redsky.target.com/v2/pdp/tcin/" + id + "?excludes=taxonomy,price,promotion,bulk_ship,rating_and_review_reviews,rating_and_review_statistics,question_answer_statistics"
        request({
            url: targetUrl,
            json: true
        }, function (error, response, targetProduct) {
            //When target returns data
            if (!error && response.statusCode === 200) {
                callback(targetProduct);
                //When target doesn't have ID info but returns default data
            } else if (!error && response.statusCode === 404) {
                console.log("ID not found on Target DB");
                res.status(400);
                callback(targetProduct);
            }
        });
    };

    //Get Mongo json by ID
    function getMongoProductJsonByID(callback) {
        //Connection URL
        const url = 'mongodb+srv://admin:admin@cluster0-rsbhl.mongodb.net/targetDB';
        //Database Name
        const dbName = 'targetDB';
        //Use connect method to connect to the server
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            //Get the documents collection
            const collection = db.collection('products');
            //Query collections by id
            collection.find({
                '_id': id
            }).toArray(function (err, data) {
                assert.equal(err, null);
                if (data === undefined || data.length == 0) {
                    console.log("ID not found on Mongo DB");
                    callback(null);
                } else {
                    callback(data[0].current_price);
                }
            });
        });
    };

    //Merge both APIs
    function mergeProductJson(callback) {
        getTargetProductJsonByID(function (targetProduct) {
            getMongoProductJsonByID(function (mongoProduct) {
                var mergedProducts = Object.assign({}, targetProduct);
                if (mongoProduct != null) {
                    mergedProducts.product.item.current_price = mongoProduct;
                    res.status(200);
                }
                callback(mergedProducts);
            });
        });
    };

    //Call merge function and send to page
    mergeProductJson(function (mergedJson) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json(mergedJson);
    });

});

//Start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);