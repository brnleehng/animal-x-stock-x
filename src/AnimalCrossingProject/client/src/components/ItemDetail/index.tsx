import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import { priceTimeSort } from '../../util/sort';

interface Props {
    itemId: string,
    uniqueEntryId: string
};

interface State {
    showAskModal: boolean,
    showBidModal: boolean,
    itemId: string,
    uniqueEntryId: string,
    asks: any[],
    bids: any[]
};

export class ItemDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAskModal: false,
            showBidModal: false,
            itemId: props.itemId,
            uniqueEntryId: props.uniqueEntryId,
            asks: [],
            bids: []
        };
    }

    async getItem(url: string) {
        const res = await fetch(url, {
            method: 'GET',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });
        return res.json();
    };

    async getOrders(url: string) {
        const res = await fetch(url, {
            method: 'GET',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });
        return res.json();
    };

    componentDidMount() {
        
        this.getOrders("/api/v1/items/5eba329ab24f9d563c32c88b/orders").then(data => this.setState({ 
            asks: data[0].orders.sort(priceTimeSort(true)).filter((order: any) => order.orderType === "Ask" && order.state === "Active"),
            bids: data[0].orders.sort(priceTimeSort(false)).filter((order: any) => order.orderType === "Bid" && order.state === "Active")
         }));
    };

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
            <Container>
                <Row className="justify-content-md-center row">
                    <Col xs={6} md={4}>
                        <Image src="https://acnhcdn.com/latest/FtrIcon/FtrCirculator_Remake_0_0.png" rounded />
                        <p>air circulator (white)</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button onClick={() => this.setState({ showAskModal: true })}>
                            View Asks
                        </Button>
                    </Col>
                    <Col>
                        <Button onClick={() => this.setState({ showBidModal: true })}>
                            View Bids
                        </Button>
                    </Col>
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
                </Row>    
                <Row className="justify-content-md-center row">
                    <Nav variant="pills" defaultActiveKey="/home" as="button">
                        <Nav.Item>
                            <Nav.Link href="/order">Place Order</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    </Row>
            </Container>
        )
    }

}