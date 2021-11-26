import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Container, Spinner, Form } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Link, Redirect } from 'react-router-dom';
import Text from '../../components/Text';
import { useFestivalMarketToken } from '../../hooks/useFestivalMarketToken';
import { useFestivalMarketPlace } from '../../hooks/useFestivalMarketPlace';
import { colors } from '../../theme';
import FestivalMarketPlace from '../../abi/FestivalMarketPlace.json';
import FestivalMarketToken from '../../abi/FestivalMarketToken.json';
import TransactionLogic from '../../abi/TransactionsLogic.json';
import FestivalTicket from '../../abi/FestivalTicket.json';
import Web3 from 'web3';

const FestButton = styled(Button).attrs({ variant: 'outline-primary'})`
    color: ${colors.darkBlue}$;
    border-color: ${colors.darkBlue}$;
    margin-top: 20px;
`;

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
 }

const Home = () => {
  var web3 = new Web3(window.ethereum);
  var festivalDetails;
  var festivalMarketPlace;
  var marketPlaceToken;
  var festivalsTickets = {};
  var transactionsLogic =  {};

  const { active, account, chainId } = useWeb3React();
  const { festivalMarketTokenAddress } = useFestivalMarketToken();
  const { festivalMarketPlaceAddress } = useFestivalMarketPlace();


    const onFetchFestivals = async () => {
        const accounts = await web3.eth.getAccounts();
        festivalMarketPlace = await new web3.eth.Contract(FestivalMarketPlace.abi, FestivalMarketPlace.networks[chainId].address);
        marketPlaceToken = await new web3.eth.Contract(FestivalMarketToken.abi, FestivalMarketToken.networks[chainId].address);
        festivalDetails = await festivalMarketPlace.methods.getFestivalsOnMarketPlace().call({from: accounts[0]});
        for(var i = 0; i < festivalDetails.length; i++){
            transactionsLogic[festivalDetails[i][0]] = new web3.eth.Contract(TransactionLogic.abi, festivalDetails[i][2]);
            var ticketsAddress = await transactionsLogic[festivalDetails[i][0]].methods.getTicketAddress().call({from:accounts[0]});
            festivalsTickets[festivalDetails[i][0]] = new web3.eth.Contract(FestivalTicket.abi, ticketsAddress);
        }
        
        var mintSelectBox = document.getElementById('mintSelect');
        removeOptions(mintSelectBox);
        for(var i = 0; i < festivalDetails.length; i++){
            mintSelectBox.options.add(new Option(festivalDetails[i][0]));
        }

    }

  const onCreateFestival = async () => {
    const accounts = await web3.eth.getAccounts();

    var festivalName = document.getElementById('festivalName').value;
    var festivalSymbol = document.getElementById('festivalSymbol').value;
    var ticketPrice = document.getElementById('ticketPrice').value;
    var organiserCommission = document.getElementById('organiserCommission').value;

    await festivalMarketPlace.methods.createFestival(festivalName,
                                                    festivalSymbol,
                                                    5,
                                                    web3.utils.toWei(ticketPrice, 'ether'),
                                                    organiserCommission,
                                                    accounts[0],
                                                    FestivalMarketToken.networks[chainId].address).send({from: accounts[0]});
  }

  const onMintTicket = async () => {
      try{
        const accounts = await web3.eth.getAccounts();
        var selectedFestival = document.getElementById('mintSelect').value;
        var festivalPosition;
        var minted = false;
        for(var i = 0; i < festivalDetails.length;i++){
            if(selectedFestival == festivalDetails[i][0]){
                festivalPosition = i;
                minted = await festivalsTickets[selectedFestival].methods.getMintStatus().call({from: accounts[0]});
            }
        }
        if(minted){
            alert('tickets have already been minted');
        }
        else{
            festivalsTickets[selectedFestival].methods.batchMint(5, festivalDetails[festivalPosition][2]).send({from: accounts[0]});
        }

      }
      catch(e){

      }
      

  }
  return (
    <Container className="mt-5 d-flex flex-column justify-content-center align-items-center">
        <Text center t1 style={{ marginTop: '20px', marginBottom: '20px'}}>
            Fetch existing festivals
        </Text>
        <FestButton onClick={onFetchFestivals}> Fetch festivals </FestButton>
        <Text center t1 style={{ marginTop: '20px', marginBottom: '20px' }}>
            Create festival tickets as NFT
        </Text>
        <Form>
            <Form.Group className="mb-3">
                <Form.Label> Festival name</Form.Label>
                <Form.Control type="text" placeholder="enter festival name" id="festivalName"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label> Festival symbol</Form.Label>
                <Form.Control type="text" placeholder="enter festival symbol" id="festivalSymbol"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label> Ticket price</Form.Label>
                <Form.Control type="text" placeholder="enter ticket price" id="ticketPrice"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label> Organiser commission</Form.Label>
                <Form.Control type="text" placeholder="enter organiser commission" id="organiserCommission"/>
            </Form.Group>
        </Form>
      <FestButton onClick={onCreateFestival}> Create festival </FestButton>

      <Text center t1 style={{marginTop: '20px', marginBottom: '20px'}}>
          Mint the tickets
      </Text>
      <Form>
        <Form.Group className="mb-3">
            <Form.Control as="select" id="mintSelect"></Form.Control>
        </Form.Group>
      </Form>
      <FestButton onClick={onMintTicket}> Mint tickets </FestButton>
    </Container>
  );
};

export default Home;