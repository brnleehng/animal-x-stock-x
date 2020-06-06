import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Redirect } from 'react-router';
import Toast from 'react-bootstrap/Toast';
import Nav from 'react-bootstrap/Nav';
import { RouteComponentProps } from 'react-router';

interface Props {
    
};

interface State  {
  password: string,
  confirmPassword: string,
  resetError: string,
  invalidToken: boolean,
  token: string
};

export class Reset extends React.Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);

    this.state = {
        password: "",
        confirmPassword: "",
        resetError: "",
        invalidToken: false,
        token: (this.props.match.params as any).token
    }

    this.submitReset = this.submitReset.bind(this);
    this.checkToken = this.checkToken.bind(this);
  }

    componentDidMount() {
        console.log(`TOKEN: ${this.state.token}`);
        this.checkToken();
        if (!this.state.token) {
            this.setState({ invalidToken: true });
            return
        }
    }

  onChange(e: any) {
    e.preventDefault();

    if (e.target.name === "password") {
        this.setState({ password: e.target.value });
    }

    if (e.target.name === "confirmPassword") {
        this.setState({ confirmPassword: e.target.value });
    }
  }

  async checkToken() {
      console.dir(`GET http://localhost:3000/reset/${this.state.token}`);
      const res = await fetch(`http://localhost:3000/reset/${this.state.token}`, {
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
      })

      if (!res.ok) {
          this.setState({ invalidToken: true });
      }

      return res.json();
  }

  async submitReset(e: any) {
    e.preventDefault();
    console.log("RESET");
    const data = {
        password: this.state.password,
        confirmPassword: this.state.confirmPassword,
    };

    const res = await fetch(`http://localhost:3000/reset/${this.state.token}`, {
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

    if (!res.ok) {
      this.setState({ resetError: "Passwords do not match" });
    } else if (res.ok) {
      this.setState({ resetError: "" });
    }

    return res.json();
  }

  render() {
    console.log(`INVALID_TOKEN: ${this.state.invalidToken}`);
    if (this.state.invalidToken === true) {
        return (
          <React.Fragment>    
            <p>"Password reset token is invalid or has expired."</p>
          </React.Fragment>
        );
    }
    return (
      
      <Form onSubmit={(e: any) => this.submitReset(e).then(
        (data: any) => {
          if (data) {
            console.log(data);
          }
        })       
        }>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>New Password</Form.Label>
          <Form.Control name="password" type="password" placeholder="Password" onChange={(e) => this.onChange(e)} required />
        </Form.Group>
        
        <Form.Group controlId="formBasicPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control name="confirmPassword" type="password" placeholder="Confirm Password" onChange={(e) => this.onChange(e)} required />
        </Form.Group>

        <Form.Row>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form.Row>

        <Toast show={this.state.resetError !== ""} onClose={() => this.setState({ resetError: "" })} delay={5000} autohide>
                <Toast.Header>
                    <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                    <strong className="mr-auto">Authentication Error</strong>
                    <small>Please make sure password and confirmPassword match...</small>
                </Toast.Header>
                <Toast.Body>
                    {this.state.resetError}
                </Toast.Body>
            </Toast>
      </Form>

    )
  }
}