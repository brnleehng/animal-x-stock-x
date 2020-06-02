import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Redirect } from 'react-router';

interface Props {
 
};

interface State  {
  email: string,
  password: string,
  isLoggedIn: boolean
};

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
        email: "",
        password: "",
        isLoggedIn: false
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

    const res = await fetch("http://localhost:3000/login", {
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
      // localStorage.setItem("user", this.state.email);
      // console.log(localStorage.getItem("user"));
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

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>

    )
  }
}
