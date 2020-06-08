import * as React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Item } from "../../Market";
import Card from 'react-bootstrap/Card';

export class ItemCard extends React.Component<Item> {
    constructor(props: Item) {
        super(props);
    }

    render() {
        let link = '/market/' + this.props.name.replace(/\s/g, '-');
        return (
            <Card className="mx-auto" style={{ width: '10rem' }}>
            <Card.Img variant="top" src={this.props.variants[0].image} />
            <Card.Body>
                <Card.Title>{this.props.name}</Card.Title>
                <Card.Text>Lowest Ask</Card.Text>
                <Card.Text>{this.props.variants[0].sell}</Card.Text>
                <Card.Link href={link}>Buy</Card.Link>
            </Card.Body>
            </Card>
        )
    }
}