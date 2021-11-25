import Provider from './Provider';
import FestivalMarketToken from '../abi/FestivalMarketToken.json';

const provider = new Provider();

class Token {
  constructor() {
    const web3 = provider.web3;
    const deploymentKey = Object.keys(FestivalMarketToken.networks)[0];

    this.instance = new web3.eth.Contract(
        FestivalMarketToken.abi,
        FestivalMarketToken.networks[deploymentKey].address,
    );
  }

  getInstance = () => this.instance;
}

const token = new Token();
Object.freeze(token);

export default token.getInstance();