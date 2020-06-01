import React from "react";
import Form from "react-bootstrap/Form";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Redirect } from 'react-router';
import Toast from 'react-bootstrap/Toast';

interface Props {
 
};

interface State  {
  username: string,
  email: string,
  password: string,
  confirmPassword: string,
  signupSuccess: boolean,
  loginRedirect: boolean
};

export class SignUp extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            signupSuccess: false,
            loginRedirect: false
        };

        this.submitSignup = this.submitSignup.bind(this);
    }

    onChange(e: any) {
        e.preventDefault();

        if (e.target.name === "username") {
            this.setState({ username: e.target.value });
            console.log(this.state.username);
        } 
        
        if (e.target.name === "email") {
            this.setState({ email: e.target.value });
        }

        if (e.target.name === "password") {
            this.setState({ password: e.target.value });
        }

        if (e.target.name === "confirm_password") {
            this.setState({ confirmPassword: e.target.value });
        }
    }

    async submitSignup(e: any) {
        e.preventDefault();
        console.log("SIGNUPPP");
        const data = {
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword
        };

        const res = await fetch("http://localhost:3000/signup", {
            method: 'POST',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(data)
        });
        if (res.ok) {
            this.setState({ signupSuccess: true });
        }
        return res.json();
    }

    render() { 
        if (this.state.loginRedirect === true) {
            return (
            <React.Fragment>    
                <Redirect to="/login" />
            </React.Fragment>
            );
        }
        return (
            <React.Fragment>
            <Toast show={this.state.signupSuccess} onClose={() => this.setState({ loginRedirect: true })} delay={3000} autohide>
                <Toast.Header>
                    <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                    <strong className="mr-auto">WOOT!</strong>
                    <small>Redirecting to login page...</small>
                </Toast.Header>
                <Toast.Body>
                    Signup successful! Please go to login page if not redirected.
                </Toast.Body>
            </Toast>
            <Form onSubmit={(e: any) => this.submitSignup(e).then(data => console.log(data))}>
            <Form.Group controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control name="username" type="text" placeholder="Enter username" onChange={(e) => this.onChange(e)} />
            </Form.Group>
            
            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control name="email" type="email" placeholder="Enter email" onChange={(e) => this.onChange(e)} />
                <Form.Text className="text-muted">
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>
        
            <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control name="password" type="password" placeholder="Password" onChange={(e) => this.onChange(e)} />
            </Form.Group>

            <Form.Group controlId="formBasicPasswordConfirmation">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control name="confirm_password" type="password" placeholder="Confirm Password" onChange={(e) => this.onChange(e)} />
            </Form.Group>

            <Form.Group controlId="formSubmit">
                <Form.Control type="submit" as="button">
                     Create Account
                </Form.Control>
            </Form.Group>
        </Form>
        </React.Fragment>

        )
    } 
} 
