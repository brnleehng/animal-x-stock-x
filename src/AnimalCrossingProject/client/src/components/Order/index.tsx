import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Toast from 'react-bootstrap/Toast';
import { RouteComponentProps } from 'react-router';
import { priceTimeSort } from '../../util/sort';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

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
    orderTypeError: string,
    userNotLoggedInError: string,
    orderSuccess: boolean,
    asks: any[],
    bids: any[],
    showAskModal: boolean,
    showBidModal: boolean
};

export class Order extends React.Component<Props & RouteComponentProps, State> {
    constructor(props: Props & RouteComponentProps) {
        super(props);
        this.state = {
            price: -1,
            orderType: "",
            bellsError: "",
            orderTypeError: "",
            userNotLoggedInError: "",
            orderSuccess: false,
            asks: [],
            bids: [],
            showAskModal: false,
            showBidModal: false,
        };

        this.submitOrder = this.submitOrder.bind(this);
    }

    componentDidMount() {
        this.getOrders(`/api/v1/items/${(this.props.location.state as any).itemId}/orders`).then(data => this.setState({ 
            asks: data[0].orders.sort(priceTimeSort(true)).filter((order: any) => order.orderType === "Ask" && order.state === "Active" && order.uniqueEntryId === (this.props.location.state as any).itemUniqueEntryId),
            bids: data[0].orders.sort(priceTimeSort(false)).filter((order: any) => order.orderType === "Bid" && order.state === "Active" && order.uniqueEntryId === (this.props.location.state as any).itemUniqueEntryId)
         }));
    };


    selectDropDown(e: any) {
        e.preventDefault();
        this.setState({ orderType: (e.target as HTMLElement).textContent! });
    }

    async getOrders(url: string) {
        const res = await fetch(url, {
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
        return res.json();
    };


    async submitOrder(e: any, data: {}) {
        e.preventDefault();
        console.log("ORRRDER")

        const userId = JSON.parse(localStorage.getItem("user")!)._id;
        let bellsError = false;
        let orderTypeError = false;
        let userNotLoggedInError = false;

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

        if (!localStorage.getItem("user")) {
            e.stopPropagation();
            this.setState({ userNotLoggedInError: "Please log in before placing order"});
            this.setState({ orderSuccess: false });
            userNotLoggedInError = true;
        }

        if (bellsError === true || orderTypeError === true || userNotLoggedInError === true) {
            return;
        }

        const res = await fetch(`/api/v1/accounts/${userId}/orders`, {
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
        const askList = this.state.asks.map((ask) =>                          
            <ListGroup.Item>
              {ask.price}
            </ListGroup.Item>       
        );

        const bidList = this.state.bids.map((bid) =>                         
            <ListGroup.Item>
                {bid.price}
            </ListGroup.Item>
        );

        return (
            <React.Fragment>
            <Form.Row className="justify-content-md-center row">
                <Col xs={6} md={4}>
                    <Image src={(this.props.location.state as any).itemImage} rounded />
                    <p>{(this.props.location.state as any).itemName}</p>
                </Col>
            </Form.Row>
            <Form.Row>
                <Modal show={this.state.showAskModal} onHide={() => this.setState({ showAskModal: false })} scrollable={true}>
                    <Modal.Header closeButton>
                    <Modal.Title>Open Asks</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup className="list-group-flush">
                            {askList}
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.setState({ showAskModal: false })}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => this.setState({ showAskModal: false })}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={this.state.showBidModal} onHide={() => this.setState({ showBidModal: false })} scrollable={true}>
                    <Modal.Header closeButton>
                    <Modal.Title>Open Bids</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ListGroup className="list-group-flush">
                            {bidList}
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.setState({ showBidModal: false })}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => this.setState({ showBidModal: false })}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
                </Modal>
            </Form.Row>
                
            <Form onSubmit={(e: any) => this.submitOrder(e, {
                                    itemId: `${(this.props.location.state as any).itemId}`,
                                    price: this.state.price,
                                    state: "Active",
                                    uniqueEntryId: `${(this.props.location.state as any).itemUniqueEntryId}`,
                                    orderType: this.state.orderType
                                }).then(data => console.log(data))}>
                
                <Form.Row>
                    <Form.Group as={Col} controlId="formGridOrderList">
                        <InputGroup>
                            <InputGroup.Prepend>
                            <InputGroup.Text id="inputGroupPrepend">View orders</InputGroup.Text>
                            </InputGroup.Prepend>
                        <DropdownButton
                            as={InputGroup.Append}
                            variant="outline-secondary"
                            title= "View Ask or Bid"
                            id="input-group-dropdown-2"
                            disabled={this.state.orderSuccess}
                            >
                            <Dropdown.Item as="button">
                                <div onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({ showAskModal: true })}
                                }>
                                    Ask
                                </div>
                            </Dropdown.Item>
                            <Dropdown.Item >
                                <div onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({ showBidModal: true })}
                                }>
                                    Bid
                                </div>
                            </Dropdown.Item>
                        </DropdownButton>
                        </InputGroup>
                    </Form.Group>
                    
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
                        <p>
                            {this.state.userNotLoggedInError}
                        </p>
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
