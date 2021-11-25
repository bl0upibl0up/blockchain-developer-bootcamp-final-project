// SPDX-License-Identifier: MIT
const FestivalMarketToken = artifacts.require('FestivalMarketToken');
const FestivalMarketPlace = artifacts.require("FestivalMarketPlace");

module.exports = async function(deployer, networks, accounts){
    await deployer.deploy(FestivalMarketToken);
    await deployer.deploy(FestivalMarketPlace);
}