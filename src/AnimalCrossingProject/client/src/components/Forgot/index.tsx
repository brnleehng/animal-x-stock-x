import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Toast from "react-bootstrap/Toast";


interface Props {
 
};

interface State  {
  email: string,
  isSubmitted: boolean
};

export class Forgot extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            email: "",
            isSubmitted: false
        };
    
    }


    onChange(e: any) {
        e.preventDefault();
        this.setState({ email: e.target.value });
    
    }

    async submitForgot(e: any) {
        e.preventDefault();
        console.log("FORGOT");
        const data = {
            email: this.state.email,
        };
    
        const res = await fetch("http://localhost:3000/forgot", {
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
            <Form onSubmit={(e: any) => this.submitForgot(e).then(
                (data) => {
                    this.setState({ isSubmitted: true });
                })       
                }>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control name="email" type="email" placeholder="Enter email" onChange={(e) => this.onChange(e)} required />
                </Form.Group>
        
                <Button variant="primary" type="submit">
                  Submit
                </Button>
        
                <Toast show={this.state.isSubmitted} onClose={() => this.setState({ isSubmitted: false })} delay={5000} autohide>
                        <Toast.Header>
                            <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                            <strong className="mr-auto">Password Reset Link Sent!</strong>
                        </Toast.Header>
                        <Toast.Body>
                            Please check email and follow link...
                        </Toast.Body>
                    </Toast>
              </Form>
        
        )
    }
}
