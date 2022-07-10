import React from "react";
import {Card, Row, Col} from "react-bootstrap";

const Front = () => {
    return (
        <Row>
            <Col xs="3">
            </Col>
            <Col xs="6">
            <Card className="text-center">
                <Card.Body>
                    <Card.Title>
                        Install Polkadot Extension
                    </Card.Title>
                    <Card.Text>
                        It appears that either Polkadot.js wallet extension is not installed
                        or the requisite permissions have not been granted.
                        <Card.Link href="https://polkadot.js.org/extension/">To Install the extension, click here</Card.Link>
                    </Card.Text>
                </Card.Body>
            </Card>
            </Col>
            <Col xs="3">
            </Col>
        </Row>
    )
}

export default Front;