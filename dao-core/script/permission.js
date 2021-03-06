/**
 * @file default_permission.js
 * @fileOverview Contract service for 'DefaultPermission'.
 * @author Andreas Olofsson (androlo1980@gmail.com)
 * @module dao_core/permission
 */
"use strict";

var async = require('async');
var util = require('util');

var ContractService = require('../../script/contract_service');
var daoUtils = require('../../script/dao_utils');

/**
 * Service for 'Permission'
 *
 * @param {Object} web3 - A web3 object.
 * @param {Object} contract - A web3 contract instance.
 * @param {number} gas - The amount of gas that will be used in transactions.
 *
 * @constructor
 * @augments module:contract_service:ContractService
 */
function Permission(web3, contract, gas) {
    ContractService.call(this, web3, contract, gas);
}

util.inherits(Permission, ContractService);

/**
 * Set the root address.
 *
 * @param {string} newRoot - The new root address.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, errorCode).
 */
Permission.prototype.setRoot = function (newRoot, txData, cb) {
    var that = this;
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.setRoot(newRoot, txData, function (error, txHash) {
        if (error) return cb(error);
        that.waitFor('SetRoot', txHash, cb);
    });
};

/**
 * Get the root address.
 *
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, rootAddress).
 */
Permission.prototype.root = function (txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.root(txData, cb);
};

/**
 * Get the root data, which includes the address and timestamp when he was added.
 *
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, data).
 */
Permission.prototype.rootData = function (txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.rootData(txData, function (error, ret) {
        if (error) return cb(error);
        var addr = ret[0];
        var time = daoUtils.bnToDate(ret[1]);
        cb(null, {address: addr, timestamp: time});
    });
};

/**
 * Add a new owner. Owners satisifies 'hasPermission', but can not add or remove other owners.
 *
 * @param {string} address - The owner address.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, errorCode).
 */
Permission.prototype.addOwner = function (address, txData, cb) {
    var that = this;
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.addOwner(address, txData, function (error, txHash) {
        if (error) return cb(error);
        that.waitFor('AddOwner', txHash, cb);
    });
};

/**
 * Remove an owner.
 *
 * @param {string} address - The owner address.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, errorCode).
 */
Permission.prototype.removeOwner = function (address, txData, cb) {
    var that = this;
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.removeOwner(address, txData, function (error, txHash) {
        if (error) return cb(error);
        that.waitFor('RemoveOwner', txHash, cb);
    });
};

/**
 * Get the timestamp when an owner was added. Also serves as an existence check.
 *
 * @param {string} address - The owner address.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, data).
 */
Permission.prototype.ownerTimestamp = function (address, txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.ownerTimestamp(address, txData, function (error, ret) {
        if (error) return cb(error);
        var time = daoUtils.bnToDate(ret[0]);
        var code = ret[1].toNumber();
        cb(null, {timestamp: time, errorCode: code});
    });
};

/**
 * Get an owner's data based on his position in the backing array.
 *
 * @param {number} index - The index.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, data).
 */
Permission.prototype.ownerFromIndex = function (index, txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.ownerFromIndex(index, txData, function (error, ret) {
        if (error) return cb(error);
        cb(null, ofiFormat(ret));
    });
};

/**
 * Get the total number of owners.
 *
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, numOwners).
 */
Permission.prototype.numOwners = function (txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.numOwners(txData, cb);
};

/**
 * Check if an address has this permission, meaning they're either root or an owner.
 *
 * @param {string} address - The address.
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, hasPermission).
 */
Permission.prototype.hasPermission = function (address, txData, cb) {
    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);
    this._contract.hasPermission(address, txData, cb);
};


/**
 * Get owners.
 *
 * If neither 'startIndex' nor 'elements' are provided, the entire collection will be fetched.
 *
 * @param {Object} queryData - {startIndex: <number>, elements: <number>}
 * @param {Object} [txData] - tx data.
 * @param {Function} cb - error first callback: function(error, data).
 */
Permission.prototype.owners = function (queryData, txData, cb) {

    var that = this;

    var block = this._web3.eth.blockNumber;

    if (typeof(txData) === 'function') {
        cb = txData;
        txData = this._txData(null);
    }
    else
        txData = this._txData(txData);

    this._contract.numOwners(txData, block, function (error, num) {
        if (error) return cb(error);
        var size = num.toNumber();

        var s = 0, e = 0;

        if (queryData && queryData.startIndex)
            s = queryData.startIndex;
        if (queryData && queryData.elements)
            e = start + queryData.elements > size ? size : start + queryData.elements;
        else
            e = size;

        var owners = [];
        var i = s;
        async.whilst(
            function () {
                return i < e;
            },
            function (cb) {
                that._contract.ownerFromIndex(i, txData, block, function (error, ret) {
                    if (error) return cb(error);
                    var fmt = ofiFormat(ret);

                    if (fmt.errorCode === 0) {
                        owners.push({address: fmt.address, timestamp: fmt.timestamp});
                    }
                    i++;
                    cb();
                });
            },
            function (err) {
                cb(err, {startIndex: s, endIndex: e, totalSize: size, blockNumber: block, owners: owners});
            }
        );

    });

};

function ofiFormat(ret) {
    return {address: ret[0], timestamp: daoUtils.bnToDate(ret[1]), errorCode: ret[2].toNumber()};
}

module.exports = Permission;