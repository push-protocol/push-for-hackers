import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";

import { Body, Button, Container, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";

import { abis, addresses } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

import * as EpnsAPI from "@epnsproject/sdk-restapi";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const ens = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  const { account, activateBrowserWallet, deactivate, error, library } = useEthers();

  // Read more about useDapp on https://usedapp.io/
  const { error: contractCallError, value: tokenBalance } =
    useCall({
       contract: new Contract(addresses.ceaErc20, abis.erc20),
       method: "balanceOf",
       args: ["0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C"],
    }) ?? {};

  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  // Getting Channel Details
  const yourChannel = '0xE8793A14bb05C2aA94ff304CfAA1B2e7823912C8';
  const [ channelDetails, setChannelDetails ] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await EpnsAPI.channels.getChannel({
        channel: `eip155:42:${yourChannel}`, // channel address in CAIP
        env: 'staging'
      });

      console.log(data);
      setChannelDetails(data);
    }

    if (!channelDetails && account) {
      console.log('Calling channel data');
      fetchData().catch(console.error);
    }
  }, [channelDetails, account]);

  // Getting Channel Opt-in -1 is not set, 0 is opted out and 1 is opted in
  const [ channelOptStatus, setChannelOptStatus ] = useState(-1);
  const [ userDetail, setUserDetail ] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const data = await EpnsAPI.user.getSubscriptions({
        user: account, // user address in CAIP or in address if defaulting to Ethereum
        env: 'staging'
      });

      console.log(data);
      let found = false;
      for (var i = 0; i < data.length; i++) {
        const element = data[i];
        console.log(element.channel);
        if (element.channel === yourChannel) {
          setChannelOptStatus(1);
          found = true;
          console.log('channel found in user opt ins')
        }

        if (found) {
          break;
        }
      }
      
      if (!found) {
        setChannelOptStatus(0);
      }
      setChannelDetails(data);
    }

    if (!userDetail && account) {
      console.log('Calling user details');
      fetchData().catch(console.error);
    }
  }, [userDetail, account]);

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      return;
    }
    if (!loading && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, subgraphQueryError, data]);

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <Image src={logo} alt="ethereum-logo" />
        <span>
          {channelDetails &&
            JSON.stringify(channelDetails)
          }
        </span>
        <p />
        {channelOptStatus != -1 &&
          <Button
            onClick={async () => {
              
              if (channelOptStatus) {
                // user subscribed, unsubscribe them
                await EpnsAPI.channels.unsubscribe({
                  signer: library.getSigner(),
                  channelAddress: `eip155:42:${yourChannel}`, // channel address in CAIP
                  userAddress: `eip155:42:${account}`, // user address in CAIP
                  onSuccess: () => {
                    setChannelOptStatus(!channelOptStatus);
                  },
                  onError: () => {
                    console.error('opt out error');
                  },
                  env: 'staging'
                })
              }
              else {
                // user unsubscribed, subscribe them
                await EpnsAPI.channels.subscribe({
                  signer: library.getSigner(),
                  channelAddress: `eip155:42:${yourChannel}`, // channel address in CAIP
                  userAddress: `eip155:42:${account}`, // user address in CAIP
                  onSuccess: () => {
                  console.log('opt in success');
                    setChannelOptStatus(!channelOptStatus);
                  },
                  onError: () => {
                    console.error('opt in error');
                  },
                  env: 'staging'
                })
              }             
            }}
          >
            {channelOptStatus ? 'Gasless opt-out' : 'Gasless opt-in'}
          </Button>
        }
      </Body>
    </Container>
  );
}

export default App;
