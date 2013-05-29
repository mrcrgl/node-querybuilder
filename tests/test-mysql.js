
var Querybuilder = require('../');
var qb = new Querybuilder('mysql');

var query = qb.select('*').from('users').where({name: 'horst'}).offset(5).call();
console.dir(query);


// Asynchronous
qb.handler(function(query, callback) {
    callback(null, query);
});

qb.select('*').from('users').where({name: 'horst'}).offset(5).call(function(err, query) {
    console.dir(err);
    console.dir(query);
});
//