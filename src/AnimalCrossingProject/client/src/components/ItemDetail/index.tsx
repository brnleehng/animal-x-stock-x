import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface Props {

};

interface State {
    showAskModal: boolean,
    showBidModal: boolean
};

export class ItemDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            showAskModal: false,
            showBidModal: false
        };
    }

    render() {
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
                    <Modal show={this.state.showAskModal} onHide={() => this.setState({ showAskModal: false })}>
                        <Modal.Header closeButton>
                        <Modal.Title>Open Asks</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ showAskModal: false })}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.setState({ showAskModal: false })}>
                            Save Changes
                        </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={this.state.showBidModal} onHide={() => this.setState({ showBidModal: false })}>
                        <Modal.Header closeButton>
                        <Modal.Title>Open Bids</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
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