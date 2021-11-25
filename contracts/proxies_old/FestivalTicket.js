import Provider from './Provider';
//import { festivalNFTABI } from '../constants';
import festivalTicket from '../abi/FestivalTicket.json';

const provider = new Provider();

const FestivalTicket = (contractAddress) => {
  const web3 = provider.web3;

  return new web3.eth.Contract(festivalTicket, contractAddress);
};

export default FestivalTicket;