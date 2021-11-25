import {useEffect, useState} from 'react';
import { useWeb3React } from '@web3-react/core';
import FestivalMarketPlace from '../abi/FestivalMarketPlace.json';

export function useFestivalMarketPlace(){
    const { chainId } = useWeb3React();
    const [ festivalMarketPlaceAddress, setFestivalMarketPlaceAddress] = useState(null);

    useEffect(() => {
        if(chainId){
            setFestivalMarketPlaceAddress(FestivalMarketPlace.networks[chainId]?.address);
        }
    }, [chainId]);

    return{
        festivalMarketPlaceAddress,
    };
}