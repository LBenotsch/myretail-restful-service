# myretail-restful-service
A simple RESTful service in Nodejs that retrieves products by ID via multiple NoSQL data stores.

# Requirements
Install NodeJS (includes NPM):
```
https://nodejs.org/en/download/
```
Cloan or download this repository, and in the same directory run:
```
npm install
```

# Instructions
Run by using:
```
node server.js
```
## GET
To test GET request, with an internet browser, go to:
```
http://localhost:8080/products/x
"x" being the ID to search

Ex.
http://localhost:8080/products/13860428

More ID's to use: 13860420, 13860421, 13860422
```
## POST
To test POST request, send a JSON body to:
```
http://localhost:8080/products/
```
Containing this example format:
```
{
    "_id": 13860422,
    "current_price": {
        "value": "30.00",
        "currency_code": "USD"
    }
}
```
Using Postman on Windows or Curl in Linux
```
https://www.getpostman.com/downloads/
or
curl -X POST -H "Content-Type: application/json" -d '{"_id": 13860422,"current_price": {"value": "30.00","currency_code": "USD"}}' http://localhost:8080/products
```
