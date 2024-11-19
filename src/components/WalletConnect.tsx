import  { useState } from "react";
import Web3 from "web3";

const ConnectWallet = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        console.log(accounts)
        setAccount(  "0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19");
      } catch (err) {
        console.error("User denied account access", err);
      }
    } else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts)
      setAccount(  "0x84aAF900942cC94A74b5A18CB012Ea8315aA6f19");
    } else {
      alert("MetaMask not installed. Please install MetaMask!");
    }
  };

  return (
    <div>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : "Connect MetaMask Wallet"}
      </button>
    </div>
  );
};

export default ConnectWallet;
