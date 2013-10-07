/*jslint maxlen:140*/
/* global require process */
'use strict';

var buster = require('buster'),
    handler = require('../lib/ecoule-data-handler-key-value-copy'),

    assert = buster.referee.assert,
    refute = buster.referee.refute
;

function throwError (err) {
    if (err) {
        throw err;
    }
}

buster.testCase('Basic écoule data-handler support', {
    'should implement an execute function': function () {
        assert.isFunction(handler({}).execute);
    },

    'should have a default match object': function () {
        assert.isObject(handler({}).match);
    },

    'should be able to overwrite match object via configuration': function () {
        var test = { match: {'foo': {equals: 'bar'}}};
        assert.same(handler({match: test}).match, test);
    }
});

buster.testCase('During initialization', {
    'should throw an error if': {
        'no directives was given': function () {
            assert.exception(function() {
                handler({}).initialize(throwError);
            });
        },

        'to: is not a string': function() {
            assert.exception(function() {
                var config = { directives: { from: 'foo', to: {} } };
                handler(config).initialize(throwError);
            });
        },

        'two to: variables is the same': function () {
            assert.exception(function() {
                var config = {
                    directives: [
                        { from: 'foo', to: 'foo' },
                        { from: 'bar', to: 'foo' }
                    ]
                };
                handler(config).initialize(throwError);
            });

            refute.exception(function() {
                var config = {
                    directives: [
                        { from: 'foo', to: 'baz' },
                        { from: 'bar', to: 'qux' }
                    ]
                };
                handler(config).initialize(throwError);
            });
        },

        'from: is not a string': function() {
            assert.exception(function() {
                var config = { directives: { from: {}, to: 'foo' } };
                handler(config).initialize(throwError);
            });

            refute.exception(function() {
                var config = { directives: { from: 'bar', to: 'foo' } };
                handler(config).initialize(throwError);
            });
        },

        'fn: is set but is not a function': function() {
            assert.exception(function() {
                var config = {
                    directives: { from: 'foo', to: 'bar', fn: 'baz' }
                };
                handler(config).initialize(throwError);
            });

            refute.exception(function() {
                var config = {
                    directives: { from: 'foo', to: 'bar', fn: function (){ } }
                };
                handler(config).initialize(throwError);
            });
        }
    }
});

buster.testCase('During execution', {
    'should copy values from keys to other keys': function() {
        var test = handler({
            directives: { from: 'foo', to: 'bar' }
        });
        var obj = {'foo': 'baz'};

        refute.defined(obj.bar);

        test.execute(obj, function () {
            assert.defined(obj.bar);
            assert.equals('baz', obj.bar);
        });
    },

    'should not overwrite values if overwrite by default': function() {
        var test = handler({
            directives: { from: 'foo', to: 'bar' }
        });
        var obj = {'foo': 'baz', 'bar': 'foo' };

        assert.equals('foo', obj.bar);
        test.execute(obj, function () {
            refute.equals('baz', obj.bar);
            assert.equals('foo', obj.bar);
        });
    },

    'should overwrite values if overwrite is true': function() {
        var test = handler({
            directives: { from: 'foo', to: 'bar', overwrite: true }
        });
        var obj = {'foo': 'baz', 'bar': 'foo' };

        assert.equals('foo', obj.bar);

        test.execute(obj, function () {
            refute.equals('foo', obj.bar);
            assert.equals('baz', obj.bar);
        });
    },

    'should delete data in the to-field if overwrite is true and the from-field is empty': function() {
        var test = handler({
            directives: { from: 'bar', to: 'foo', overwrite: true }
        });
        var obj = { 'foo': 'baz' };

        assert.defined(obj.foo);
        assert.equals('baz', obj.foo);

        test.execute(obj, function () {
            refute.defined(obj.foo);
        });
    },

    'should execute functions on from-fields if a function is set': function() {
        var test = handler({
            directives: {
                from: 'foo',
                to: 'bar',
                fn: function(data) {
                    return data.toUpperCase();
                }
            }
        });
        var obj = { 'foo': 'baz' };

        test.execute(obj, function () {
            assert.equals(obj.bar, 'BAZ');
        });
    }
});