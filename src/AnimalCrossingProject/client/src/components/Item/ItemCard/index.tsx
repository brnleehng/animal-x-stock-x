import * as React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Item, Variant } from "../../Market";
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';


export class ItemCard extends React.Component<Item & Variant> {
    constructor(props: Item & Variant) {
        super(props);
    }

    render() {
        let link = '/market/' + this.props.name.replace(/\s/g, '-');
        return (
            <Card className="mx-auto" style={{ width: '10rem' }}>
            <Card.Img variant="top" src={this.props.image} />
            <Card.Body>
                <Card.Title>{this.props.name}</Card.Title>
                <Card.Text>Lowest Ask</Card.Text>
                <Card.Text>{this.props.variants[0].sell}</Card.Text>
                <Card.Link>
                    <Link to={{
                        pathname: `${link}`,
                        state: {
                            itemId: `${this.props._id}`,
                            itemUniqueEntryId: `${this.props.uniqueEntryId}`,
                            itemName: `${this.props.name}`,
                            itemVariant: `${this.props.variant}`,
                            itemImage: `${this.props.image}`
                        }
                    }}>Buy</Link>
                </Card.Link>
            </Card.Body>
            </Card>
        )
    }
}