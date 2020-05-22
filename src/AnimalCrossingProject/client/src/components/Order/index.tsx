import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';


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
    orderSuccess: string
};

export class Order extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            price: -1,
            orderType: "",
            bellsError: "",
            orderTypeError: "",
            orderSuccess: ""
        };

        this.submitOrder = this.submitOrder.bind(this);
    }


    selectDropDown(e: any) {
        e.preventDefault();
        this.setState({ orderType: (e.target as HTMLElement).textContent! });
    }

    async submitOrder(e: any, url: string, data: {}) {
        e.preventDefault();
        
        if (!Number.isInteger(this.state.price) || this.state.price < 0) {    
            e.stopPropagation();
            this.setState({ bellsError: "Please enter a positive whole number of bells"});
        } else {
            this.setState({ bellsError: "" });
        }

        if (this.state.orderType === "") {    
            e.stopPropagation();
            this.setState({ orderTypeError: "Please select an order type bid/ask"});
        } else {
            this.setState({ orderTypeError: "" });
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
        return res.json();

    }

    render() {
        return (
            <React.Fragment>
            <Row className="justify-content-md-center row">
                <Col xs={6} md={4}>
                    <Image src="https://acnhcdn.com/latest/FtrIcon/FtrCirculator_Remake_0_0.png" rounded />
                    <p>air circulator (white)</p>
                </Col>
            </Row>
            <Form onSubmit={(e: any) => this.submitOrder(e, "http://localhost:3000/api/v1/accounts/5ebcd526604792518c6c5f17/orders", {
                                    itemId: "5eba329ab24f9d563c32c88b",
                                    price: this.state.price,
                                    state: "Active",
                                    uniqueEntryId: "J4inuBziPCSGZNEPM",
                                    orderType: this.state.orderType
                                }).then(data => console.log(data))}>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridBells">
                    <InputGroup>
                        <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroupPrepend">Bells</InputGroup.Text>
                        </InputGroup.Prepend>
                    <Form.Control onChange={(e) => this.setState({ price: +e.target.value }) } type="text" />
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
                        <Form.Control type="submit" as="button">
                                Submit Order
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
            </Form>
            </React.Fragment>
        )
    }
}
