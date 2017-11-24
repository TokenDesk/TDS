'use strict';

const assertRevert = require('./helpers/assertRevert');
// const expectThrow = require('./helpers/expectThrow');

var testAccounts = ["0x8a0c43a16f0a15814fbed72c7cb462d7d7545cb8", "0x2fcf7b5a28c54d9ff5fbaad9e5e1b630892a425b",
    "0xa5ae0013f78bb62902ec8031e3540b527d49189a", "0x08093335bb665a00b5d89a5dbfdf761d35aa34bb", "0x70e1c394ec14a456d91025470f733e0a3a7fb026"];
var threeTestAccounts = ["0x0eb067c91a2a6c0b831b8f2bd50a2ad0f018c2fa", "0x1a71794b5d5eb101a15180edfb362f5f9ac2084b", "0xf69ff983925ccf11ff7663f912ffb5c1552a34ad"];
var fourAmounts = [10, 20, 30, 40];


var TokenDeskToken = artifacts.require("./TokenDeskToken");

contract("TokenDeskToken", function () {
    let contract;
    let contractDecimals;

    beforeEach(async function() {
        // return TokenDeskToken.at("0x43b3e6afad50be0fb6434957d2a11917a6e1d575")
        contract = await TokenDeskToken.new();
        contractDecimals = await contract.decimals();
    });

    it("should issue 100 tokens to the first account", function () {
        return TokenDeskToken.deployed().then(function(instance) {
            contract = instance;
            return contract.issueTokens(testAccounts[0], 100);
        }).then(function () {
            return contract.balanceOf.call(testAccounts[0]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 100 * Math.pow(10, contractDecimals), "error, 100 was not issued to the first address");
        })
    });

    it("should fail to issue tokens for incorrect input", function () {
        var currentTotalSupply;

        return TokenDeskToken.deployed().then(function(instance) {
            contract = instance;
            return contract.issueTokensMulti(threeTestAccounts, fourAmounts);
        }).catch(function(err) {
            // ok
        }).then(function () {
            return contract.balanceOf.call(threeTestAccounts[0]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 0, "error, should not have issued tokens for " + threeTestAccounts[0]);
        }).then(function () {
            return contract.balanceOf.call(threeTestAccounts[1]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 0, "error, should not have issued tokens for " + threeTestAccounts[1]);
        }).then(function () {
            return contract.balanceOf.call(threeTestAccounts[2]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 0, "error, should not have issued tokens for " + threeTestAccounts[2]);
        }).then(function () {
            return contract.issueTokens("", 100);
        }).catch(function(err) {
            // ok
        }).then(function () {
            return contract.balanceOf.call("");
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 0, "error, should not have issued tokens for an empty address");
        }).then(function () {
            return contract.totalSupply.call();
        }).then(function (totalSupply) {
            currentTotalSupply = totalSupply.valueOf();
        }).then(function () {
            return contract.TOKENS_SALE_HARD_CAP.call();
        }).then(function (saleCap) {
            return contract.issueTokens(testAccounts[1], saleCap.valueOf() - currentTotalSupply + 1);
        }).catch(function(err) {
            // ok
        }).then(function () {
            return contract.totalSupply.call();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.valueOf(), currentTotalSupply, "error, should not have issued any tokens when sum is over the limit");
        }).then(function () {
            var over100investors = [];
            var amounts = [];
            while(over100investors.length < 101) over100investors.push(testAccounts[2]);
            while(amounts.length < 101) amounts.push(1);

            contract.issueTokensMulti(over100investors, amounts);
        }).catch(function(err) {
            console.log(err);
        }).then(function () {
            return contract.totalSupply.call();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.valueOf(), currentTotalSupply, "error, should not have issued any tokens");
        });
    });

    it("should succeed to issue tokens for correct input", function () {
        var currentTotalSupply;
        var saleHardCap;
        return TokenDeskToken.deployed().then(function(instance) {
            contract = instance;
            return contract.issueTokensMulti(threeTestAccounts, [1, 2, 3]);
        }).catch(function(err) {
            console.log(err);
        }).then(function () {
            return contract.balanceOf.call(threeTestAccounts[1]);
        }).then(function (balance) {
            assert.equal(balance.valueOf(), 2 * Math.pow(10, contractDecimals), "error, 2 tokens were not issued to the second address");
        }).then(function () {
            return contract.totalSupply.call();
        }).then(function (totalSupply) {
            currentTotalSupply = totalSupply.valueOf();
        }).then(function () {
            return contract.TOKENS_SALE_HARD_CAP.call();
        }).then(function (saleCap) {
            saleHardCap = saleCap.valueOf();
            return contract.issueTokens(testAccounts[1], (saleHardCap - currentTotalSupply) / Math.pow(10, contractDecimals));
        }).catch(function(err) {
            console.log(err);
        }).then(function () {
            return contract.totalSupply.call();
        }).then(function (totalSupply) {
            assert.equal(totalSupply.valueOf(), saleHardCap.valueOf(), "error, should have issued all possible sale tokens");
        }).then(function () {
            return contract.saleHardCapReached.call();
        }).then(function (saleHardCapReached) {
            assert.equal(saleHardCapReached.valueOf(), true, "error, should have returned that cap is reached");
        }).then(function () {
            return contract.close();
        }).then(function () {
            return contract.tokenSaleClosed.call();
        }).then(function (closedSale) {
            assert.equal(closedSale.valueOf(), true, "error, should have closed the sale");
        });
    });
});