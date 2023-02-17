import React, { useState, useCallback, useEffect } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BN from "bn.js";

import { MARKETPLACE_ADDRESS_ROCOCO, RPC_URL_ROCOCO } from "../assets/constants";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
const proofSize = 131072;
const refTime = 6219235328;
const storageDepositLimit = null;

const Mint = (props) => {
  const [mintDisable, setMintDisable] = useState(false);
  const [formState, setFormState] = useState({ name: "", description: "" });
  const [nftURL, setNftURL] = useState(null);
  const [displayMessage, setDisplayMessage] = useState(null);
  const [files, setFiles] = useState([]);

  const checkErrorsAndUploadToIPFS = async () => {
    const { name, description } = formState;

    if (!name || !description) {
      alert("Name and Description fields are necessary");
      return;
    }

    if (!nftURL) {
      alert("Your NFT didn't upload to IPFS.");
      return;
    }

    const tokenURI = JSON.stringify({
      name,
      description,
      image: nftURL,
    });

    try {
      const added = await client.add(tokenURI);
      //const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      return added.path;
    } catch (error) {
      console.log(error);
    }
  };

  const sendFileToIPFS = async (e) => {
    if (files) {
      try {
        const formData = new FormData();
        formData.append("file", files);

        console.log({ formData });

        console.log({ REACT_APP_PINATA_JWT: process.env.REACT_APP_PINATA_JWT });

        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = JSON.stringify(`ipfs://${resFile.data.IpfsHash}`);
        console.log(ImgHash);
        //Take a look at your Pinata Pinned section, you will see a new file added to you list.
        setMintDisable(true);

        const wsProvider = new WsProvider(RPC_URL_ROCOCO);
        const api = await ApiPromise.create({provider: wsProvider});
        await api.isReady;

        const {gasRequired, result, output} = await props.nftContract.query["customMint::mint"]
          (props.activeAccount.address,{gasLimit: api.registry.createType('WeightV2', {
          refTime,
          proofSize,
        }), storageDepositLimit},props.activeAccount.address,ImgHash,MARKETPLACE_ADDRESS_ROCOCO);

        const gasLimit = api.registry.createType('WeightV2', gasRequired);
        // const { gasRequired, result, output } =
        //   await props.nftContract.query.get(props.activeAccount.address, {
        //     gasLimit,
        //     storageDepositLimit,
        //   });

        // console.log({ gasRequired, result, output });

        if (ImgHash) {
          await props.nftContract.tx["customMint::mint"](
            {gasLimit : gasLimit, storageDepositLimit},
            props.activeAccount.address,
            ImgHash,
            MARKETPLACE_ADDRESS_ROCOCO
          ).signAndSend(
            props.activeAccount.address,
            { signer: props.signer },
            async (res) => {
              if (res.status.isInBlock) {
                console.log('in a block')
              } else if (res.status.isFinalized) {
                console.log('finalized')
              }
            }
          );
        }
      } catch (error) {
        console.log("Error sending File to IPFS: ");
        console.log(error);
      }
    }
  };

  const onHandleMint = async (e) => {
    setMintDisable(true);
    const uri = await checkErrorsAndUploadToIPFS();
    console.log(uri);

    const gasLimit = -1;

    let item = await props.nftContract.query["psp34::collectionId"](
      props.activeAccount.address,
      { gasLimit }
    );

    console.log(item);

    if (uri) {
      await props.nftContract.tx
        .mint({ gasLimit }, uri)
        .signAndSend(
          props.activeAccount.address,
          { signer: props.signer },
          (result) => {
            console.log("Transaction status:", result.status.type);
            setDisplayMessage(result.status.type);
            if (result.status.isInBlock) {
              console.log(
                "Included at block hash",
                result.status.asInBlock.toHex()
              );
              setDisplayMessage(result.status.type);
            }

            if (result.status.isFinalized) {
              console.log(
                "Finalized block hash",
                result.status.asFinalized.toHex()
              );
              setDisplayMessage(result.status.type);

              //setDisplayMessage(result.status.asFinalized.toHex());
              process.exit(0);
            }
          }
        );
    }

    //await item.wait();
    setMintDisable(false);
    console.log(item);
  };

  const onHandleFileChange = async (e) => {
    const file = e.target.files[0];
    setFiles(file);
    
  };

  return (
    <Container>
      <Row>
        <Col></Col>
        <Col xs="6">
          <Form>
            <Form.Group className="mb-3" controlId="mintForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="NFT name"
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="mintForm.ControlTextarea1">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                onChange={(e) =>
                  setFormState({ ...formState, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group controlId="mintForm.File" className="mb-3">
              <Form.Label>Upload Image File</Form.Label>
              <Form.Control type="file" onChange={onHandleFileChange} />
            </Form.Group>
            <Button
              variant="danger"
              onClick={sendFileToIPFS}
              disabled={mintDisable}
            >
              Mint
            </Button>
            <Form.Group>
              <Form.Label>{displayMessage}</Form.Label>
            </Form.Group>
          </Form>
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
};

export default Mint;
