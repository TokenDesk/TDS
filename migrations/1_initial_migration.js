//var Migrations = artifacts.require("./Migrations.sol");
var TokenDeskToken = artifacts.require("./TokenDeskToken");

module.exports = function(deployer) {
  deployer.deploy(TokenDeskToken);
};
