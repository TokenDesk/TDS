var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
module.exports = {
  networks: {
    infura: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/$API_KEY"),
      network_id: '*',
      gas: 3000000
    },
    ropsten: {
//      provider: new Web3.providers.HttpProvider("http://localhost:8545"),
      network_id: '*',
      gas: 3000000
    }
  }
};
