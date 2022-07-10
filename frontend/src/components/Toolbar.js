import React,{useState} from 'react';
import {NavDropdown,Navbar,Nav,Button,Container} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Toolbar = () => {
    const [activeItem,setActiveItem] = useState('PSP34');

    return (
        <Navbar bg="info" expand="lg">
            <Container>
                <LinkContainer to="/">
                    <Navbar.Brand >NFT Market</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse className="justify-content-end">
                <Nav>
                    <LinkContainer to="/mint"><Nav.Link >Create</Nav.Link></LinkContainer>
                    <LinkContainer to="/dashboard"><Nav.Link>Dashboard</Nav.Link></LinkContainer>
                </Nav>
                </Navbar.Collapse>
            </Container>
            </Navbar>
    )
}

export default Toolbar;