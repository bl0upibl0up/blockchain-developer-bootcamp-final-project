import Provider from './Provider';
import transactionsLogic from '../abi/TransactionsLogic.json';

const provider = new Provider();

const TransactionsLogic = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(transactionsLogic, contractAddress);
};

export default TransactionsLogic;