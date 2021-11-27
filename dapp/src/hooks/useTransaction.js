// https://github.com/jsur/blockchain-developer-bootcamp-final-project
import { useAppContext } from '../AppContext';

const useTransaction = () => {
  const { setTxnStatus, txnStatus } = useAppContext();
  return { setTxnStatus, txnStatus };
};

export default useTransaction;