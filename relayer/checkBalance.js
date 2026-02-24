import { contract } from "./config.js";

const user = "0x50200a40066aDf6C5e02c5946895fE1110D2459A";

(async () => {
  const bal = await contract.balances(user);
  console.log("Onchain balance:", bal.toString());
})();