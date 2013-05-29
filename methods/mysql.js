/**
 * @author: Marc Riegel <mail@marclab.de>
 * Date: 02.03.13
 * Time: 21:57
 *
 */

var ToMysql = {

  qb: null,

  query: function (oQueryBuilder) {

    this.qb = oQueryBuilder;

    var query = null;

    if (this.qb._queryType == 'select') {
      query = this._parseQuerySelect();
    } else if (this.qb._queryType == 'count') {
      query = this._parseQueryCount();
    } else if (this.qb._queryType == 'update') {
      query = this._parseQueryUpdate();
    } else if (this.qb._queryType == 'delete') {
      query = this._parseQueryDelete();
    } else if (this.qb._queryType == 'insert') {
      query = this._parseQueryInsert();
    }


    return query;
  },

  _parseQuerySelect: function () {
    return 'SELECT '
      + this._parseFields()
      + ' FROM '
      + this._parseTable()
      + this._parseWhere()
      + this._parseOrder()
      + this._parseGroup()
      + this._parseLimit();
  },

  _parseQueryCount: function () {
    return 'SELECT COUNT(*) AS `count` '
      + ' FROM '
      + this._parseTable()
      + this._parseWhere();
  },

  _parseQueryUpdate: function () {
    return 'UPDATE '
      + this._parseTable()
      + ' SET '
      + this._parseDataSet()
      + this._parseWhere()
      + this._parseLimit();
  },

  _parseQueryInsert: function () {
    return 'INSERT INTO '
      + this._parseTable()
      + ' SET '
      + this._parseDataSet();
  },

  _parseQueryDelete: function () {
    return 'DELETE FROM '
      + this._parseTable()
      + this._parseWhere()
      + this._parseLimit();
  },

  _parseFields: function () {
    if (typeof this.qb._fields == 'string') {
      return this.qb._fields;
    }
    if (this.qb._fields instanceof Array) {
      // TODO escape
      return this.qb._fields.join(', ');
    }
    return '*';
  },

  _parseTable: function () {
    if (typeof this.qb._table == 'string') {
      return this._escapeField(this.qb._table);
    }

    throw "No Table defined!";
  },

  _parseWhere: function () {

    if (this.qb._where instanceof Object
      && Object.keys(this.qb._where).length > 0) {
      return ' WHERE ' + this._parseClause(this.qb._where);
    }

    return ' WHERE 1';
  },

  _parseGroup: function () {
    if (this.qb._group instanceof Array && this.qb._group.length > 0) {
      return ' GROUP BY ' + this.qb._group.join(', ');
    }

    return '';
  },

  _parseOrder: function () {
    if (this.qb._order instanceof Object) {
      var keys = Object.keys(this.qb._order);
      if (keys.length > 0) {
        var group = [];
        for (var key in keys) {
          if (keys.hasOwnProperty(key)) {
            // TODO escape
            group.push(keys[key] + ' ' + ((this.qb._order[keys[key]] === 1) ? 'ASC' : 'DESC'));
          }
        }
        return ' ORDER BY ' + group.join(', ');
      }

    }

    return '';
  },

  _parseLimit: function () {
    if (this.qb._limit && this.qb._offset) {
      return ' LIMIT ' + this.qb._limit + ',' + this.qb._offset;
    }
    if (this.qb._limit) {
      return ' LIMIT ' + this.qb._limit
    }
    return '';
  },

  _parseDataSet: function () {
    if (this.qb._set instanceof Object) {
      return this._escapeObjectToValues(this.qb._set);
    }

    throw "No data given to insert."
  },

  _parseClause: function (clause, wheres, joiner) {
    if (!wheres) wheres = [];
    if (!joiner) joiner = 'AND';

    var checkFnc = new RegExp(/^\$/);

    var clauseKeys = Object.keys(clause);
    for (var i in clauseKeys) {
      var field = clauseKeys[i];
      var value = clause[field];

      if (checkFnc.test(field)) {
        // function
        var fnc = field.substr(1);

        if (fnc == 'or') {
          if (value instanceof Array) {
            var pieces = [];
            for (var n in value) {
              pieces.push(this._parseClause(value[n], []));
            }

            wheres.push(pieces.join(' OR '));
          }
        } else if (fnc == 'and') {
          if (value instanceof Array) {
            var pieces = [];
            for (var n in value) {
              pieces.push(this._parseClause(value[n], []));
            }

            wheres.push(pieces.join(' AND '));
          }
        }

      } else {
        if (typeof(value) == 'object') {

          if (value.hasOwnProperty('$gte')) {
            wheres.push(field + ' >= ' + this._escapeValue(value['$gte']));
          } else if (value.hasOwnProperty('$gt')) {
            wheres.push(field + ' >= ' + this._escapeValue(value['$gt']));
          } else if (value.hasOwnProperty('$lte')) {
            wheres.push(field + ' >= ' + this._escapeValue(value['$lte']));
          } else if (value.hasOwnProperty('$lt')) {
            wheres.push(field + ' >= ' + this._escapeValue(value['$lt']));
          } else if (value.hasOwnProperty('$not')) {
            wheres.push(field + ' != ' + this._escapeValue(value['$lt']));
          } else if (value.hasOwnProperty('$like')) {
            wheres.push(field + ' LIKE ' + this._escapeValue('%' + value['$like'] + '%'));
          } else if (value.hasOwnProperty('$in')) {
            if (value['$in'] instanceof Array) {
              wheres.push(field + ' IN ' + this._escapeValue(value['$in']));
            }
          }

        } else {
          wheres.push(this._escapeField(field) + ' = ' + this._escapeValue(value));
        }
      }
    }

    return '(' + wheres.join(' ' + joiner + ' ') + ')';
  },

  _escapeField: function (field) {
    return '`' + field.replace(/`/g, '``').replace(/\./g, '`.`') + '`';
  },

  _escapeValue: function (value) {

    if (value === undefined || value === null) {
      return 'NULL';
    }

    switch (typeof value) {
      case 'boolean':
        return (value) ? 'true' : 'false';
      case 'number':
        return value + '';
    }

    if (value instanceof Date) {
      value = this._escapeDateToString(value);
    }

    if (Buffer.isBuffer(value)) {
      return this._escapeBufferToString(value);
    }

    if (Array.isArray(value)) {
      return this._escapeArrayToList(value);
    }

    if (typeof value === 'object') {
      return this._escapeObjectToValues(value);
    }

    value = value.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
      switch (s) {
        case "\0":
          return "\\0";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\b":
          return "\\b";
        case "\t":
          return "\\t";
        case "\x1a":
          return "\\Z";
        default:
          return "\\" + s;
      }
    });
    return "'" + value + "'";
  },

  _escapeArrayToList: function (array) {
    var self = this;
    return array.map(function (v) {
      if (Array.isArray(v)) return '(' + self._escapeArrayToList(v) + ')';
      return self._escapeValue(v, true, 'local');
    }).join(', ');
  },

  _escapeDateToString: function (date) {
    var dt = new Date(date);

    var year = dt.getFullYear();
    var month = zeroPad(dt.getMonth() + 1);
    var day = zeroPad(dt.getDate());
    var hour = zeroPad(dt.getHours());
    var minute = zeroPad(dt.getMinutes());
    var second = zeroPad(dt.getSeconds());

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  },

  _escapeBufferToString: function (buffer) {
    var hex = '';
    try {
      hex = buffer.toString('hex');
    } catch (err) {
      for (var i = 0; i < buffer.length; i++) {
        var byte = buffer[i];
        hex += zeroPad(byte.toString(16));
      }
    }

    return "X'" + hex + "'";
  },

  _escapeObjectToValues: function (object) {
    var values = [];
    for (var key in object) {
      var value = object[key];
      if (typeof value === 'function') {
        continue;
      }

      values.push(this._escapeField(key) + ' = ' + this._escapeValue(value, true));
    }

    return values.join(', ');
  }

};

function zeroPad(n) {
  return (n < 10) ? '0' + n : n;
};

module.exports = ToMysql;