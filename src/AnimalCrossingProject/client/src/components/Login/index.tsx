import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Props {
 
};

interface State  {
  email: string,
  password: string,
};

export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
        email: "",
        password: "",
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
    return res.json();
  }

  render() {
    return (
      <Form onSubmit={(e: any) => this.submitLogin(e).then(data => console.log(data))}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control name="email" type="email" placeholder="Enter email" onChange={(e) => this.onChange(e)} />
        </Form.Group>
        
        <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" placeholder="Password" onChange={(e) => this.onChange(e)} />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>

    )
  }
}
