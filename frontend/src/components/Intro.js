import React, {useCallback} from 'react';

import {Row, Col, Card, Button} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

const Intro = () => {
    const navigate = useNavigate();
    const handleOnCreate = useCallback(() => navigate('/mint', {replace: true}), [navigate]);
    const handleOnExplore = useCallback(() => navigate('/explore', {replace: true}), [navigate]);

    return(
        <Row >
                <Col xs="3">
                </Col>
                <Col xs="6">
                    <Card>
                        <Card.Body>
                            <Card.Title>
                                BUY. CREATE. SELL.
                            </Card.Title>
                            <Card.Text>
                                NFT Marketplace to create, sell and buy NFTs. 
                                You can buy/sell NFTs using direct sales or Timed Auctions.
                            </Card.Text>
                            <Button variant="danger" onClick={handleOnCreate}>Create</Button>{'     '}
                            <Button variant="danger" onClick={handleOnExplore}>Explore</Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs="3">
                </Col>
            </Row>
    )
}

export default Intro;