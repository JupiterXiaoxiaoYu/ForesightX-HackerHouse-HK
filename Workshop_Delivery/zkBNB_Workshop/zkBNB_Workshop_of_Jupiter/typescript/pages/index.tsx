//@ts-nocheck
import Image from 'next/image'
import { Client } from '@bnb-chain/zkbnb-js-sdk';
import { Inter } from 'next/font/google'
import NFTGallery from '@/components/NFTGallery'
import Head from 'next/head'
import React from 'react';

const inter = Inter({ subsets: ['latin'] })
const client = new Client('https://api-testnet.zkbnbchain.org')



async function fetchNFT() {
  // first get the account index by address
  const acct_res = await client.getAccountByL1Address("0x4f400eC2eC6567CC6C643748a7c59Fd870FcB5cc")

  // then get the NFTs by account index
  const index = acct_res.index
  const requestParm = {accountIndex: index, offset: 0, limit: 10}
  const data = await client.getNftsByAccountIndex(requestParm)

  // preload all the metadata
  for (const nft of data.nfts) {
    const metadata_url = 'https://ipfs.io/ipfs/' + nft.ipfs_id;
    const resp = await fetch(metadata_url)
    const resp_json = await resp.json()
    console.log('=====nft====', resp_json)
    nft.metadata = JSON.parse(resp_json.meta_data)
  }

  return data.nfts
}

export const getStaticProps = async () => {
  try {
    console.log("Getting NFTs...")

    const nfts = await fetchNFT()
    const props = JSON.stringify(nfts)

    return {
      props: {
        props
      },
      revalidate: 600
    };
  } catch (err) {
    console.error('page error', err)
    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}


const NFTGallery = ({props}) => {
    const nfts = JSON.parse(props)
    console.log("NFT objects:")
    console.log(nfts)
    return (
        <div className='container mx-auto pt-1 mb-4'>
            <div className='row row-cols-lg-4'>
                {nfts.map(token => <NFTCard key={token.index} nft={token}/>)}
            </div>
        </div>
    );
}
export default NFTGallery;



//component that takes an nft object and maps it to corresponding elements
const NFTCard = ({ nft }) => {
    return (
        <div className="col pt-4 ">
            <div className='card shadow-lg p-2'>
                <img src={nft.metadata.image} alt="NFT" className="card-image-top" />
                <div className="card-body">
                    <h5 className="card-title text-dark">{nft.metadata.name}</h5>
                    <p className="card-text text-dark">{nft.metadata.description}</p>
                </div>
            </div>
        </div>
    )
}

export default NFTCard;



export default function Home(props) {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Story&apos;s zkBNB NFT</h1>
        <NFTGallery {...props} />
      </main>
    </>
  )
}