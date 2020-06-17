import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Redirect } from 'react-router';
import Toast from 'react-bootstrap/Toast';
import Nav from 'react-bootstrap/Nav';

interface Props {
 
};

interface State  {
  email: string,
  password: string,
  isLoggedIn: boolean,
  authError: string
};

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
        email: "",
        password: "",
        isLoggedIn: false,
        authError: ""
    };

    this.submitLogin = this.submitLogin.bind(this);
  }

  onChange(e: any) {
    e.preventDefault();

    if (e.target.name === "email") {
        this.setState({ email: e.target.value });
    }

    if (e.target.name === "password") {
        this.setState({ password: e.target.value });
    }
  }

  async submitLogin(e: any) {
    e.preventDefault();
    console.log("LOGIN");
    const data = {
        email: this.state.email,
        password: this.state.password,
    };

    const res = await fetch("/login", {
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

    // if (res.ok) {
    //   // localStorage.setItem("user", this.state.email);
    //   // console.log(localStorage.getItem("user"));
    // }
    if (res.status === 401) {
      this.setState({ authError: "Wrong email or password" });
    } else if (res.ok) {
      this.setState({ authError: "" });
    }

    return res.json();
  }

  render() {
    if (this.state.isLoggedIn ===  true) {
      return (<Redirect to="/" />);
    }
    return (
     
      <Form onSubmit={(e: any) => this.submitLogin(e).then(
        (data) => {
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log(JSON.parse(localStorage.getItem("user")!).email);
            this.setState({ isLoggedIn: true });
            window.location.reload();

          }
        })       
        }>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control name="email" type="email" placeholder="Enter email" onChange={(e) => this.onChange(e)} required />
        </Form.Group>
        
        <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" placeholder="Password" onChange={(e) => this.onChange(e)} required />
        </Form.Group>

        <Form.Row>
          <Button variant="primary" type="submit">
            Submit
          </Button>
          <Nav variant="pills" defaultActiveKey="/home" as="button">
              <Nav.Item>
                  <Nav.Link href="/forgot">Forgot Password?</Nav.Link>
              </Nav.Item>
          </Nav>
        </Form.Row>

        <Toast show={this.state.authError !== ""} onClose={() => this.setState({ authError: "" })} delay={5000} autohide>
                <Toast.Header>
                    <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                    <strong className="mr-auto">Authentication Error</strong>
                    <small>Please check email and password...</small>
                </Toast.Header>
                <Toast.Body>
                    {this.state.authError}
                </Toast.Body>
            </Toast>
      </Form>

    )
  }
}
