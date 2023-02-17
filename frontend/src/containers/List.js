import { useEffect, useState } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import {
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ADDRESS_ROCOCO,
} from "../assets/constants";

const proofSize = 131072;
const refTime = 6219235328;

const List = (props) => {
  const [bidValue, setBidValue] = useState(0);
  const [isBidding, setIsBidding] = useState(true);

  const onBidValueChange = (e) => {
    setBidValue(e.target.value);
  };

  const onBid = () => {
    setIsBidding(false);
  };

  const onSell = () => {};

  const onBidCancel = () => {
    setIsBidding(true);
  };

  useEffect(
    () => async () => {
      console.log("HELLLLLLO");
      if (props.nftContract) {
        console.log("HELLO", props.nftContract.address);
        const storageDepositLimit = null;
        const { result, output } = await props.nftContract.query[
          "psp34::ownerOf"
        ](MARKETPLACE_ADDRESS_ROCOCO, { value: 0, gasLimit: -1 }, { u64: "1" });

        console.log({ result, output });
      }
    },
    [props.nftContract]
  );

  return (
    <Container className="text-center">
      <h1 className="mb-5">Your NFTs</h1>
      <Card style={{ width: "18rem" }} className="shadow">
        <Card.Img
          variant="top"
          src="https://static.news.bitcoin.com/wp-content/uploads/2021/09/polkadot.jpg"
        />
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
          {isBidding ? (
            <div className="d-flex justify-content-between">
              <input
                type="number"
                value={bidValue}
                onChange={(e) => onBidValueChange(e)}
              ></input>
              <Button variant="primary" onClick={onBid}>
                Bid
              </Button>
            </div>
          ) : (
            <div className="d-flex justify-content-evenly">
              <Button variant="primary px-5" onClick={onSell}>
                Sell
              </Button>
              <Button variant="danger" onClick={onBidCancel}>
                Cancel
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default List;
