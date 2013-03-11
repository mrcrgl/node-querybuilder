/**
 * @author: Marc Riegel <mail@marclab.de>
 * Date: 11.03.13
 * Time: 10:24
 *
 */

var ToMongoDB = {

    qb: null,

    query: function(oQueryBuilder) {

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

    _getWhat: function() {
        return (this.qb._fields == '*') ? undefined : this.qb._fields;
    },

    _getWhere: function() {
        return (Object.keys(this.qb._where || {}).length < 1) ? {} : this.qb._where;
    },

    _getLimit: function() {
        return (this.qb._limit < 1) ? null : this.qb._limit;
    },

    _getSkip: function() {
        return (this.qb._offset < 1) ? null : this.qb._offset;
    },

    _getSort: function() {
        return (Object.keys(this.qb._order || {})._order < 1) ? null : this.qb._order;
    },

    _getUpdateSet: function() {
        return (Object.keys(this.qb._set || {})._order < 1) ? null : this.qb._set;
    }
};

module.exports = ToMongoDB;