import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';


interface Props {
    accountId: string,
    itemName: string,
    itemVariant: string,
    itemId: string,
    imagePath: string,
};

interface State  {
    price: number,
    orderType: string
};

export class Order extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            price: 0,
            orderType: ""
        };

        this.submitOrder = this.submitOrder.bind(this);
    }


    selectDropDown(e: any) {
        e.preventDefault();
        this.setState({ orderType: (e.target as HTMLElement).textContent! });
    }

    async submitOrder(e: any, url: string, data: {}) {
        e.preventDefault();

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
            <Form>
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridBells">
                    <InputGroup>
                        <InputGroup.Prepend>
                        <InputGroup.Text id="inputGroupPrepend">Bells</InputGroup.Text>
                        </InputGroup.Prepend>
                    <Form.Control onChange={(e) => this.setState({ price: +e.target.value }) } type="text"/>
                    </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formGridOrderType">
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroupPrepend">Bells</InputGroup.Text>
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
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} controlId="formSubmit">
                        <Form.Control type="submit" as="button"
                            // TODO: replace accountId with logged in user accountId
                            // TODO: replace hardcoded values with params
                            onClick={(e: any) => this.submitOrder(e, "http://localhost:3000/api/v1/accounts/5ebcd526604792518c6c5f17/orders", {
                                    itemId: "5eba329ab24f9d563c32c88b",
                                    price: this.state.price,
                                    state: "Active",
                                    uniqueEntryId: "J4inuBziPCSGZNEPM",
                                    orderType: this.state.orderType
                                }).then(data => console.log(data))}>
                                Submit Order
                        </Form.Control>
                    </Form.Group>
                </Form.Row>
            </Form>

        )
    }
}