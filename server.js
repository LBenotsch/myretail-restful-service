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

//GET product data by ID (ex. use id 13860428 or 15117729)
app.get('/products/:id', function (req, res) {
    //Store requested ID
    var id = parseInt(req.params.id);
    //Connection URL
    const url = 'mongodb+srv://admin:admin@cluster0-rsbhl.mongodb.net/targetDB';
    //Database Name
    const dbName = 'targetDB';
    //Use connect method to connect to the server
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        findProducts(db, function () {
            client.close();
        });
    });

    const findProducts = function (db, callback) {
        //Get the documents collection
        const collection = db.collection('products');
        //Query collections by filter
        collection.find({
            '_id': id
        }).toArray(function (err, data) {
            assert.equal(err, null);
            callback(data);
            res.send(JSON.stringify(data));
        });
    }

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    console.log("/ GET - Product Search - ID:"+id);
});

//start the server
app.listen(port);
console.log('Server started! At http://localhost:' + port);