/**
 * @author: Marc Riegel <mail@marclab.de>
 * Date: 02.03.13
 * Time: 18:32
 *
 */

var QueryBuilder = function (methodName) {

  this._queryType = 'select';
  this._fields = '*';
  this._table = null;
  this._where = {};
  this._order = {};
  this._group = [];
  this._limit = 50;
  this._offset = 0;
  this._handler = null;
  this._set = {};

  this.processor = null;

  this._loadMethod(methodName);
};

QueryBuilder.prototype.select = function (clause) {

  if (undefined !== clause) {
    this.where(clause);
  }

  this._queryType = 'select';

  return this;
};

QueryBuilder.prototype.count = function (clause) {

  if (undefined !== clause) {
    this.where(clause);
  }

  this._queryType = 'count';

  return this;
};

QueryBuilder.prototype.update = function (clause) {

  if (undefined !== clause) {
    this.set(clause);
  }

  this._queryType = 'update';

  return this;
};

QueryBuilder.prototype.delete = function (clause) {

  if (undefined !== clause) {
    this.where(clause);
  }

  this._queryType = 'delete';

  return this;
};

QueryBuilder.prototype.insert = function (clause) {

  if (undefined !== clause) {
    this.set(clause);
  }

  this._queryType = 'insert';

  return this;
};

QueryBuilder.prototype.call = function (callback) {

  var query = this.processor.query(this);

  if (typeof this._handler == 'function') {
    this._handler(query, callback);
  } else {
    return query;
  }

};

QueryBuilder.prototype.set = function (object) {

  this._set = object || {};

  return this;
};

QueryBuilder.prototype.from = function (table) {

  this._table = table;

  return this;
};

QueryBuilder.prototype.where = function (clause) {

  this._where = clause;

  return this;
};

QueryBuilder.prototype.or = function (clause) {

  return this;
};

QueryBuilder.prototype.order = function (order) {

  this._order = order;

  return this;
};

QueryBuilder.prototype.limit = function (limit) {

  this._limit = limit;

  return this;
};

QueryBuilder.prototype.offset = function (offset) {

  this._offset = offset;

  return this;
};

QueryBuilder.prototype.handler = function (fnc) {

  this._handler = fnc;

  return this;
};

QueryBuilder.prototype.and = QueryBuilder.prototype.where;

QueryBuilder.prototype._loadMethod = function(methodName) {
    try {
        this.processor = require(__dirname + '/methods/' + methodName.toLowerCase());
    } catch(e) {
        throw "Method " + methodName + " corrupt: " + e;
    }
};


module.exports = QueryBuilder;