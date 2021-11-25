import React from 'react';
import { Container } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import Text from '../../components/Text';
import { useFestivalMarketToken } from '../../hooks/useFestivalMarketToken';
import { colors } from '../../theme';

const Home = () => {
  const { active } = useWeb3React();
  const { festivalMarketTokenAddress } = useFestivalMarketToken();
  console.log(festivalMarketTokenAddress);

  const NotActive = () => {
    return (
      <Text>
        Connect{' '}
        {
          <Text>
            <a style={{ color: colors.green }} href="https://faucet.ropsten.be/" target="blank">
              Ropsten
            </a>
          </Text>
        }{' '}
        wallet to continue.
      </Text>
    );
  };

  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
      <Text center t1 style={{ marginBottom: '20px' }}>
        Create your Festival tickets as NFT
      </Text>
      {!active && <NotActive />}
    </Container>
  );
};

export default Home;