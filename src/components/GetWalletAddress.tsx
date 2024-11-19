import Web3 from "web3";

export const getWalletAddress = async (): Promise<string | null> => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      console.log(accounts)
      return "0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19";
    } catch (err) {
      console.error("User denied account access", err);
      return null;
    }
  } else if (window.web3) {
    const web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.getAccounts();
    console.log(accounts)
    return "0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19";
  } else {
    alert("MetaMask not installed. Please install MetaMask!");
    return null;
  }
};
