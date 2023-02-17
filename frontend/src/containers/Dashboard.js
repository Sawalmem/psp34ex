import React,{useState, useEffect, useCallback} from "react";
import {Container, Row, Col, Card, Button} from "react-bootstrap";
import { create as ipfsHttpClient, CID } from 'ipfs-http-client';
import { ApiPromise, WsProvider } from "@polkadot/api";
import Front from "../components/Front";
import {Buffer} from 'buffer';
import {useNavigate} from 'react-router-dom';
import { MARKETPLACE_ADDRESS_ROCOCO, RPC_URL_ROCOCO } from "../assets/constants";
import BN from "bn.js";

let storageDepositLimit = null;

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const Dashboard = (props) => {
    const [active,setActive] = useState(null);
    const [ownerNFTTotal,setOwnerNFTTotal] = useState();
    const [uidArray,setUidArray] = useState([]);
    const [ownerNFTURI,setOwnerNFTURI] = useState(null);
    const navigate = useNavigate();
    const handleOnMint = useCallback(() => navigate('/mint', {replace: true}), [navigate]);

    console.log("Owner NFT Total", ownerNFTTotal);
    console.log(ownerNFTURI);

    
    const check_account = async () => {
        if (props?.activeAccount?.address) {
            setActive(props.activeAccount.address);
        }
    }

    useEffect(() => {
        check_account();
    },[props.activeAccount])

    const load_balance = async () => {
        const wsProvider = new WsProvider(RPC_URL_ROCOCO);
        const api = await ApiPromise.create({provider: wsProvider});
        await api.isReady;
        const gasLimit = api.registry.createType("WeightV2", {
        refTime: new BN("10000000000"),
        proofSize: new BN("10000000000"),
        });
        console.log(props.nftContract);
        const {gasRequired, result, output} = await props.nftContract.query["psp34::balanceOf"]
        (props.activeAccount.address,{gasLimit : gasLimit, storageDepositLimit},props.activeAccount.address);
        console.log(result.toHuman());

        // the gas consumed for contract execution
        console.log(gasRequired);

        // check if the call was successful
        if (result.isOk) {
        // output the return value
        console.log('Success', output?.toHuman());

        if (output) {
            let str = output?.toString();
            setOwnerNFTTotal(parseInt(str.replace(/\D/g, "")));
        }
        } else {
        console.error('Error', result.asErr);
        }
    }

    useEffect(() => {
        load_balance();
    })

    const load_uids = async () => {
        if (ownerNFTTotal > 0) {
            let arr = [];
            console.log("total : ",ownerNFTTotal);
            const wsProvider = new WsProvider(RPC_URL_ROCOCO);
            const api = await ApiPromise.create({provider: wsProvider});
            await api.isReady;
            const gasLimit = api.registry.createType("WeightV2", {
             refTime: new BN("10000000000"),
            proofSize: new BN("10000000000"),
            });

            for (let i = 0; i < ownerNFTTotal; ++i) {

                const {gasRequired, result, output} = await props.nftContract.query["psp34Enumerable::ownersTokenByIndex"]
                (props.activeAccount.address,{gasLimit : gasLimit, storageDepositLimit},props.activeAccount.address,i).then(
                    output => arr.push(output)
                );
                //console.log(i);
                //let uidx = uid.output.Ok.U8.toHuman();
                //console.log("UIDX",uidx);
                //let uri = await props.nftContract.query.getTokenUri
                //(props.activeAccount.address,{gasLimit},uid);
                //console.log(uri.output.toHuman());
                //arr.push(uri.output.toHuman());
            }
            setUidArray(arr);
            //setOwnerNFTURI(arr);
        }
    }

    useEffect(() => {
        load_uids();
    },[ownerNFTTotal])

    const load_hashes = async () => {
        if (ownerNFTTotal > 0) {
            const wsProvider = new WsProvider(RPC_URL_ROCOCO);
            const api = await ApiPromise.create({provider: wsProvider});
            await api.isReady;
            const gasLimit = api.registry.createType("WeightV2", {
             refTime: new BN("10000000000"),
            proofSize: new BN("10000000000"),
            });
            let arr = [];

            for (let i = 0; i < ownerNFTTotal; ++i) {
                let uid = uidArray[i].output.toHuman().Ok.U64;
                console.log("uid",uidArray[i]);
                //console.log(uid.output.toHuman().Ok.U8);
                //console.log("UIDX",uid.toNumber());
                const {gasRequired, result, output} = await props.nftContract.query["customMint::getTokenUri"]
                (props.activeAccount.address,{gasLimit : gasLimit, storageDepositLimit},uid).then(
                    output => arr.push(output)
                )
                //console.log(uri.output.toHuman());
                //arr.push(uri.output.toHuman());
            }
            console.log(arr);

            for (let i = 0; i < ownerNFTTotal;++i) {
                let cid = arr[i];
                //let str = arr[i].split("/");
                console.log(cid);
                //cid = str[str.length-1];
                const cidformat = "f" + cid.substring(2);
                console.log("cid : ",cidformat);
                //const cidV0 = new CID(cidformat).toV0().toString();
                const resp = await client.cat(cid);
                let content = [];
                for await (const chunk of resp) {
                    content = [...content, ...chunk];
                }

                console.log(content.toString());

                const raw = Buffer.from(content).toString('utf8');
                arr[i] = JSON.parse(raw);
                //console.log(JSON.parse(raw));
                //let str = arr[i].split("/");
                //console.log(str[str.length-1]);
            }

            setOwnerNFTURI(arr);
            
        }
    }

    useEffect(() => {
        load_hashes();
    },[uidArray])

    if (!active) {
        return (<Front />)
    }
    else {
        return (
            <Container>
                <Row>
                    <Col xs="3">
                    </Col>
                    <Col xs="6" className="text-center">
                        <h3>Dashboard</h3>
                    </Col>
                    <Col xs="3"></Col>
                </Row>
                {!ownerNFTURI ? 
                <Row>
                    <Col xs="3">
                    </Col>
                    <Col xs="6" className="text-center">
                        <Card>
                            <Card.Body>
                            <Card.Text>
                                Looks like you don't have any NFTs in your dashboard. 
                                You can mint them here. 
                            </Card.Text>
                            <Button variant="danger" onClick={handleOnMint}>Mint</Button>
                            </Card.Body>
                            
                        </Card>
                    </Col>
                    <Col xs="3"></Col>
                </Row> :
                <Row xs={1} md={2} className="g-4">
                    {ownerNFTURI.map((nft, idx) => (
                        <Col>
                        <Card>
                            <Card.Img variant="top" src={nft.image} />
                            <Card.Body>
                            <Card.Title>{nft.name}</Card.Title>
                            <Card.Text>
                                {nft.description}
                            </Card.Text>
                            </Card.Body>
                        </Card>
                        </Col>
                    ))}
                </Row> }

            </Container>
        )
    }

}

export default Dashboard;