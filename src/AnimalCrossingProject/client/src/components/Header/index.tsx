import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';

function Header() {
    
    return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="/">StalkX</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Form inline>
                    <FormControl type="text" placeholder="Search" className="mr-sm-2" />
                    <Button variant="outline-info">Search</Button>
                </Form>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="/market">Market</Nav.Link>
                        <Nav.Link href="/contact">Contact</Nav.Link>
                        <Nav.Link href="/order">Order</Nav.Link>
                        <Nav.Link href="/itemDetail">Item Detail</Nav.Link>
                        <Nav.Link href="/about">About</Nav.Link>
                    </Nav>

                    <Nav className="user-action">
                        <Nav.Link href="/signup">Create Account</Nav.Link>
                        <Nav.Link href="/login">Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

    )
}

export default Header;