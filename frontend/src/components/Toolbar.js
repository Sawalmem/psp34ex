import React, { useState } from "react";
import { NavDropdown, Navbar, Nav, Button, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const Toolbar = () => {
  const [activeItem, setActiveItem] = useState("PSP34");

  return (
    <Navbar bg="primary" expand="lg" className="mb-5">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <p class="text-white">NFT Market</p>
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <LinkContainer to="/mint">
              <Nav.Link>
                <p class="text-white">Mint</p>
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/dashboard">
              <Nav.Link>
                <p class="text-white">Dashboard</p>
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/list">
              <Nav.Link>
                <p class="text-white">List</p>
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Toolbar;
