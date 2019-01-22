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

//GET product data by ID (ex. use id 13860428 or 13860420)
app.get('/products/:id', function (req, res) {
    //Store initial ID
    var id = req.params.id;

    //Check for valid ID
    if (!isNaN(id)) {
        //Store valid ID
        id = parseInt(req.params.id);
    } else {
        console.log("Invalid ID was searched");
        res.send("Invalid ID was searched");
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
            if (!error && response.statusCode === 200) {
                callback(targetProduct);
            } else if (!error && response.statusCode === 404) {
                console.log("ID not found on Target DB");
                callback(targetProduct);
            }
        });
    };

    //Get Mongo json by ID
    function getMongoProductsJsonByID(callback) {
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
            //Query collections by filter
            collection.find({
                '_id': id
            }).toArray(function (err, data) {
                assert.equal(err, null);
                if (data === undefined || data.length == 0) {
                    console.log("ID not found on Mongo DB");
                    callback("");
                } else {
                callback(data[0].current_price);
                }
            });
        });
    };

    //Merge both APIs
    function mergeProductJson(callback) {
        getTargetProductJsonByID(function (targetProduct) {
            getMongoProductsJsonByID(function (mongoProduct) {
                var mergedProducts = Object.assign({}, targetProduct);
                mergedProducts.product.item.current_price = mongoProduct;
                callback(mergedProducts);
            });
        });
    };

    //Calll merge function and send
    mergeProductJson(function (mergedJson) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.send(JSON.stringify(mergedJson));
    });

    console.log("/ GET - Product Search - ID:" + id);
});

//Start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);