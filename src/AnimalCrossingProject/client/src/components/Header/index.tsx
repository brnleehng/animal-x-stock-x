import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Redirect } from 'react-router';


interface Props {
 
};

interface State  {
  isLoggedOut: boolean,
};

export class Header extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            isLoggedOut: false
        };
    }

    async submitLogout(e: any) {
        e.preventDefault();
        console.log("LOGOUT");
    
        const res = await fetch("http://localhost:3000/logout", {
            method: 'GET',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });
        if (res.ok) {
            localStorage.removeItem("user");
            this.setState({ isLoggedOut: true });
            window.location.reload();
        }
        return res.json();
    }

    render() {
        if (this.state.isLoggedOut === true) {
            return (<Redirect to="/" />); 
        }
        return (
            <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">StalkX</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/items">Market</Nav.Link>
                    <Nav.Link href="/about">About</Nav.Link>
                    <Nav.Link href="/contact">Contact</Nav.Link>
                    <Nav.Link href="/order">Order</Nav.Link>
                    <Nav.Link href="/itemDetail">Item Detail</Nav.Link>
                    
                </Nav>

                <Nav className="user-action">
                    { localStorage.getItem("user") ?
                        null :
                        <Nav.Link href="/signup">Create Account</Nav.Link>
                    }
                    { localStorage.getItem("user") ? 
                        <Nav.Link onClick={(e: any) => this.submitLogout(e).then(data => console.log(data))}>Logout</Nav.Link> :
                        <Nav.Link href="/login">Login</Nav.Link>
                    }
                </Nav>
            </Navbar.Collapse>
            </Navbar>

        )
    }
}
