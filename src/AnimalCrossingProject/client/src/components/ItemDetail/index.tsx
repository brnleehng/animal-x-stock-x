import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';

interface Props {

};

interface State {

};

export class ItemDetail extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
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
                <Row className="justify-content-md-center row">
                    <Nav variant="pills" defaultActiveKey="/home">
                        <Nav.Item>
                            <Nav.Link href="/order">Order</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    </Row>
            </Container>
        )
    }

}