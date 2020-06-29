import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';

interface Props {
    image: string,
    uniqueEntryId: string,
    name: string,
    offer: number,
};

export class ItemListing extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <Container>
                <Row className="justify-content-md-center row">
                    <Image src={this.props.image} rounded />
                </Row>
                <Row className="justify-content-md-center row">
                    <h1>{this.props.name}</h1>
                </Row>
                <Row className="justify-content-md-center row">
                    <h1>{this.props.offer}</h1>
                </Row>
            </Container>
        )
    }
}