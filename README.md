node-querybuilder
=================

Querybuilder have a simple, mongo like, API to create SQL and NoSQL queries. 

## Install
```bash
$ npm install querybuilder
```

## Supported storages / client libs

* MongoDB (Tested with [node-mongodb-native](https://github.com/mongodb/node-mongodb-native))
* MySQL (Tested with [node-mysql](https://github.com/felixge/node-mysql))

## API

### Create NoSQL query (MongoDB)

```javascript
var Querybuilder = require('querybuilder');
var qb = new Querybuilder('mongodb');

// Synchronous
var query = qb.select('*')
              .where({name: 'horst'})
              .offset(5)
              .call();
/* <- returns: 
{ type: 'select',
  what: undefined,
  where: { name: 'horst' },
  limit: 50,
  skip: 5,
  sort: {},
  set: {} }
*/

// Asynchronous
// Define a handler. We simply forward the query to the callback
qb.handler(function(query, callback) {
  
    // Your SQL connection can be placed here
    callback(null, query);
});

qb.select('*')
  .from('users') // just for campability to mysql
  .where({name: 'horst'})
  .offset(5)
  .call(function(err, query) {
    if (err) throw new Error(err);
    
    console.dir(query);
    // <- equal to synchronous
});
```

### Create SQL query (MySQL)

```javascript

var Querybuilder = require('querybuilder');
var qb = new Querybuilder('mysql');

// Synchronous
var query = qb.select('*')
              .from('users')
              .where({name: 'horst'})
              .offset(5)
              .call();
// <- returns: 'SELECT * FROM `users` WHERE (`name` = \'horst\') LIMIT 50,5'


// Asynchronous
// Define a handler. We simply forward the query to the callback
qb.handler(function(query, callback) {
  
    // Your SQL connection can be placed here
    callback(null, query);
});

qb.select('*')
  .from('users')
  .where({name: 'horst'})
  .offset(5)
  .call(function(err, query) {
    if (err) throw new Error(err);
    
    console.dir(query);
    // <- equal to synchronous
});
```

Module under MIT Licence
