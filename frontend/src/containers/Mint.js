import React, { useState, useCallback, useEffect } from "react";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { MARKETPLACE_ADDRESS_ROCOCO } from "../assets/constants";

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

        const gasLimit = -1;

        // const { gasRequired, result, output } =
        //   await props.nftContract.query.get(props.activeAccount.address, {
        //     gasLimit,
        //     storageDepositLimit,
        //   });

        // console.log({ gasRequired, result, output });

        if (ImgHash) {
          await props.nftContract.tx["customMint::mint"](
            props.activeAccount,
            ImgHash,
            MARKETPLACE_ADDRESS_ROCOCO,
            { gasLimit }
          ).signAndSend(
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
    // try {
    //   const added = await client.add(file, {
    //     progress: (prog) => console.log(`received: ${prog}`),
    //   });
    //   console.log(added, added.path);
    //   const url = `https://ipfs.infura.io/ipfs/${added.path}`;
    //   setNftURL(url);
    // } catch (error) {
    //   console.log("Error uploading file: ", error);
    // }
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
