import {useEffect, useState} from 'react';
import { useWeb3React } from '@web3-react/core';
import FestivalMarketToken from '../abi/FestivalMarketToken.json';

export function useFestivalMarketToken(){
    const { chainId } = useWeb3React();
    const [ festivalMarketTokenAddress, setFestivalMarketTokenAddress] = useState(null);

    useEffect(() => {
        if(chainId){
            setFestivalMarketTokenAddress(FestivalMarketToken.networks[chainId]?.address);
        }
    }, [chainId]);

    return{
        festivalMarketTokenAddress,
    };
}