import Provider from './Provider';
import festivalMarketPlace from '../abi/FestivalMarketPlace.json';

const provider = new Provider();

class FestivalMarketPlace {
  constructor() {
    const web3 = provider.web3;
    const deploymentKey = Object.keys(festivalMarketPlace.networks)[0];

    this.instance = new web3.eth.Contract(
        festivalMarketPlace.abi,
        festivalMarketPlace.networks[deploymentKey].address,
    );
  }

  getInstance = () => this.instance;
}

const festivalMP = new festivalMarketPlace();
Object.freeze(festivalMP);

export default festivalMP.getInstance();