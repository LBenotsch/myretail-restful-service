# myretail-restful-service
A simple RESTful service in Nodejs that retrieves products by ID via multiple NoSQL data stores.

# Instructions
Run by using:
```
node server.js
```

With an internet browser, ("xxxx" being the ID to search) go to:
```
http://localhost:8080/products/xxxx

Ex.
http://localhost:8080/products/13860420
```

To Post request, send a JSON body to:
```
http://localhost:8080/products/
```
That contains this format:
```
{
"_id":13860422, //ID to update
"current_price":{
  "value":"30.00",
  "currency_code":"USD"
  }
}
```
