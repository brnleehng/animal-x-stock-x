import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Toast from 'react-bootstrap/Toast';
import { RouteComponentProps } from 'react-router';



interface Props {
    accountId: string,
    itemName: string,
    itemVariant: string,
    itemId: string,
    imagePath: string,
};

interface State  {
    price: number,
    orderType: string,
    bellsError: string,
    orderTypeError: string
    orderSuccess: boolean
};

export class Order extends React.Component<Props & RouteComponentProps, State> {
    constructor(props: Props & RouteComponentProps) {
        super(props);
        this.state = {
            price: -1,
            orderType: "",
            bellsError: "",
            orderTypeError: "",
            orderSuccess: false
        };

        this.submitOrder = this.submitOrder.bind(this);
    }


    selectDropDown(e: any) {
        e.preventDefault();
        this.setState({ orderType: (e.target as HTMLElement).textContent! });
    }

    async submitOrder(e: any, url: string, data: {}) {
        e.preventDefault();
        console.log("ORRRDER")
        let bellsError = false;
        let orderTypeError = false;

        if (!Number.isInteger(this.state.price) || this.state.price < 1) {    
            e.stopPropagation();
            this.setState({ bellsError: "Please enter a positive whole number of bells"});
            this.setState({ orderSuccess: false });
            bellsError = true;
        } else {
            this.setState({ bellsError: "" });
        }

        if (this.state.orderType === "") {    
            e.stopPropagation();
            this.setState({ orderTypeError: "Please select an order type bid/ask"});
            this.setState({ orderSuccess: false });
            orderTypeError = true;
        } else {
            this.setState({ orderTypeError: "" });
        }

        if (bellsError === true || orderTypeError === true) {
            return;
        }

        const res = await fetch(url, {
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
            this.setState({ orderSuccess: true });
        } 
        return res.json();

    }

    render() {
        return (
            <React.Fragment>
            <Form.Row className="justify-content-md-center row">
                <Col xs={6} md={4}>
                    <Image src={(this.props.location.state as any).itemImage} rounded />
                    <p>{(this.props.location.state as any).itemName}</p>
                </Col>
            </Form.Row>
            <Form onSubmit={(e: any) => this.submitOrder(e, "http://localhost:3000/api/v1/accounts/5ebcd526604792518c6c5f17/orders", {
                                    itemId: `${(this.props.location.state as any).itemId}`,
                                    price: this.state.price,
                                    state: "Active",
                                    uniqueEntryId: `${(this.props.location.state as any).itemUniqueEntryId}`,
                                    orderType: this.state.orderType
                                }).then(data => console.log(data))}>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridBells">
                    <InputGroup>
                        <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroupPrepend">Bells</InputGroup.Text>
                        </InputGroup.Prepend>
                    <Form.Control onChange={(e) => this.setState({ price: +e.target.value }) } type="text" disabled={this.state.orderSuccess}/>
                    <p>
                        {this.state.bellsError}
                    </p>
                    </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridOrderType">
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroupPrepend">Order Type</InputGroup.Text>
                            </InputGroup.Prepend>
                        <DropdownButton
                            as={InputGroup.Append}
                            variant="outline-secondary"
                            title= {this.state.orderType || "Select Ask or Bid"}
                            id="input-group-dropdown-2"
                            disabled={this.state.orderSuccess}
                            >
                            <Dropdown.Item as="button">
                                <div onClick={(e) => this.selectDropDown(e)}>
                                    Ask
                                </div>
                            </Dropdown.Item>
                            <Dropdown.Item >
                                <div onClick={(e) => this.selectDropDown(e)}>
                                    Bid
                                </div>
                            </Dropdown.Item>
                        </DropdownButton>
                        <p>
                            {this.state.orderTypeError}
                        </p>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formSubmit">
                        <Form.Control type="submit" as="button" disabled={this.state.orderSuccess}>
                                Submit Order
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
                </Form>
                <Form.Row className="justify-content-md-end row">

                    <Toast show={this.state.orderSuccess} onClose={() => this.setState({ orderSuccess: false })}>
                        <Toast.Header>
                            <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
                            <strong className="mr-auto">WOOT!</strong>
                            <small>just now</small>
                        </Toast.Header>
                    <Toast.Body>
                        Order successfully made!
                    </Toast.Body>
                    <Toast.Body>
                        Item: {(this.props.location.state as any).itemName}
                    </Toast.Body>
                    <Toast.Body>
                        Bells: {this.state.price}
                    </Toast.Body>
                    <Toast.Body>
                        Order Type: {this.state.orderType}
                    </Toast.Body>
                    </Toast> 

                </Form.Row>
            
            </React.Fragment>
        )
    }
}
