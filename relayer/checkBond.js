import { contract } from "./config.js";

(async () => {
  const bond = await contract.RELAYER_BOND();
  console.log("Bond value:", bond.toString());
})();
