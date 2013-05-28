/**
 * @author: Marc Riegel <mail@marclab.de>
 * Date: 11.03.13
 * Time: 10:24
 *
 */

var MongoDB = require('mongodb'),
  ObjectID = MongoDB.ObjectID,
  Timestamp = MongoDB.Timestamp;


var ToMongoDB = {

  qb: null,

  query: function (oQueryBuilder) {

    this.qb = oQueryBuilder;

    var query = {
      type: this.qb._queryType,
      what: this._getWhat(),
      where: this._getWhere(),
      limit: this._getLimit(),
      skip: this._getSkip(),
      sort: this._getSort(),
      set: this._getUpdateSet()
    };
    return query;
  },

  _getWhat: function () {
    return (this.qb._fields == '*') ? undefined : this.qb._fields;
  },

  _getWhere: function () {
    return (Object.keys(this.qb._where || {}).length < 1) ? {} : this._mongonize(this.qb._where);
  },

  _getLimit: function () {
    return (this.qb._limit < 1) ? null : this.qb._limit;
  },

  _getSkip: function () {
    return (this.qb._offset < 1) ? null : this.qb._offset;
  },

  _getSort: function () {
    return (Object.keys(this.qb._order || {})._order < 1) ? null : this._mongonize(this.qb._order);
  },

  _getUpdateSet: function () {
    return (Object.keys(this.qb._set || {})._order < 1) ? null : this._mongonize(this.qb._set);
  },

  _mongonize: function (object) {
    if (object instanceof Object || object instanceof Array) {
      // Object
      for (var key in object) {
        //console.dir(key + " -> " + object[key]);
        object[key] = this._mongonize(object[key]);
      }

      return object;
    } else {
      // All others
      if (object instanceof Date) {
        // do something with date?
      }

      var testId = new RegExp(/^[0-9a-f]{24}$/);

      try {
        if (testId.test(object.toString())) {
          //console.dir(" -> -> " + object);
          object = new ObjectID(object.toString());
          return object;
        }

        if (object.toString().toLowerCase() == 'true') {
          object = true;
          return object;
        }

        if (object.toString().toLowerCase() == 'false') {
          object = false;
          return object;
        }
      } catch (e) {
        // Object is not stringable
      }

      return object;
    }
  }
};

module.exports = ToMongoDB;