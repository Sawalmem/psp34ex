import React,{useState,useEffect,useCallback} from "react";
import {Button, Card, Row, Col, Form} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Front from "../components/Front";

const Home = (props) => {
    const [active,setActive] = useState(null);
    const [sChoices,setSChoices] = useState([]);
    const navigate = useNavigate();
    const handleOnMint = useCallback(() => navigate('/mint', {replace: true}), [navigate]);
    const handleOnDashboard = useCallback(() => navigate('/dashboard', {replace: true}), [navigate]);

    console.log("active",active);
    console.log("schoices",sChoices);

    const check_account = async () => {
        if (props?.activeAccount?.address) {
            setActive(props.activeAccount.address);
        }
    }

    useEffect(() => {
        check_account();
    },[props.activeAccount])

    const check_all = () => {
        if (props?.allAccounts?.length > 0) {
            let temp = [];
            for ( let i = 0; i < props.allAccounts.length; ++i) {
                let obj = {value: i, name: props.allAccounts[i].address};
                temp.push(obj);
            }
            setSChoices(temp);
        }
    }

    useEffect(() => {
        check_all();
    },[props.allAccounts])

    if (!active) {
        return(
            <Front />
        )
    } else {
        return (
            <Row> 
                <Col xs="3">
                </Col>
                <Col xs="6">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>
                                MINT NFTs
                            </Card.Title>
                            <Card.Text>
                                {active}
                            </Card.Text>
                            <Form.Select onChange={props.onHandleSelect}>
                                <option>Select Another Account</option>
                                {sChoices.map(choice => (<option value={choice.value}>{choice.name}</option>))}
                            </Form.Select>
                            <br />
                            <Button variant="danger" onClick={handleOnMint}>Mint</Button>{'     '}
                            <Button variant="danger" onClick={handleOnDashboard}>Dashboard</Button>{'     '}
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs="3">
                </Col>
            </Row>
        )
    }

    
}

export default Home;