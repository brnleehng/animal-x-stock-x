import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { priceTimeSort } from '../../util/sort';
import { ItemCard } from "../Item/ItemCard";

export interface Variant {
    image: string;
    variation: string;
    filename: string;
    variantId: string;
    uniqueEntryId: string;
    colors: string[];
    pattern?: null | string;
    bodyTitle?: null | string;
    bodyCustomize?: boolean | null;
    buy: number;
    sell: number;
    internalId: number;
    source: string[];
    themes: string[];
}

export interface Item {
    name: string;
    variant: string;
    sourceSheet: string;

    pattern: string;
    patternTitle: string;
    diy: boolean;
    category: string;
    tag: string;
    source: string;
    imagePath: string;
    version: string;
    variants: Variant[];
}

interface Props {
    image: string,
    uniqueEntryId: string,
    name: string,
    offer: number
};

interface ItemProps {
    image: string,
    name: string,
    trade: number,
    low: number,
    variants: number
};

export class ItemRow extends React.Component<Item> {
    constructor(props: Item){
        super(props);
    }
    render() {
        return (
            <ListGroup.Item>
                <Container>
                    <Row>
                        <Col xs={6}>
                            <img src={this.props.variants[0].image} />
                            {this.props.name}
                        </Col>
                        <Col xs={2} >
                            {this.props.tag}
                        </Col>
                        <Col xs={2}>
                            {this.props.sourceSheet}
                        </Col>
                        <Col xs={2}>
                            {this.props.sourceSheet}
                        </Col>
                    </Row>
                </Container>
            </ListGroup.Item>
        );
    }
}

interface MarketProps {
    image: string;
}
  
interface MarketState {
    items: Item[];
}

export class Market extends React.Component<MarketProps, MarketState>{
    constructor(props: MarketProps){
        super(props);
        this.state = {
            items: []
        };
    }

    async listItems(url: string) {
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
    }

    componentDidMount() {
        this.listItems("http://localhost:3000/api/v1/items").then(data => {
            this.setState({ items: data });
        });
    }

    render() {
        const header = (<ListGroup.Item>
                            <Container>
                                <Row>
                                    <Col xs={6}>
                                        Item
                                    </Col>
                                    <Col xs={2} >
                                        Featured
                                    </Col>
                                    <Col xs={2}>
                                        Lowest Ask
                                    </Col>
                                    <Col xs={2}>
                                        Highest Bid
                                    </Col>
                                </Row>
                            </Container>
        </ListGroup.Item>);
        const itemList = this.state.items.map((x) =>{
            let payload = x as Item;
            return (
                <Col className="mt-2 mb-2 mx-auto d-flex align-items-stretch" xs={2.5}>
                    <ItemCard {...payload} />
                </Col>
            )
        });

        return (
            <Container>
                <Row>
                    <Col><h2>MarketPlace</h2></Col>
                </Row>
                <Row>
                    <Col xs={2}>
                        <ListGroup>
                            <ListGroup.Item>Clothing</ListGroup.Item>
                            <ListGroup.Item>Equipments</ListGroup.Item>
                            <ListGroup.Item>Collectibles</ListGroup.Item>
                            <ListGroup.Item>Furniture</ListGroup.Item>
                            <ListGroup.Item>Nature</ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col xs={10}>
                        <Row className="d-flex justify-content-end">
                            <Col>
                                <DropdownButton id="dropdown-item-button" size="sm" title="Sort By">
                                    <Dropdown.Item as="button">Featured</Dropdown.Item>
                                    <Dropdown.Item as="button">Most Popular</Dropdown.Item>
                                    <Dropdown.Item as="button">New Lowest Asks</Dropdown.Item>
                                </DropdownButton>{' '}
                                <Button variant="primary" size="sm">
                                    Gallery
                                </Button>{' '}
                                <Button variant="secondary" size="sm">
                                    List
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            {itemList}
                        </Row>
                        
                    </Col>
                </Row>
            </Container>
        )
    }
}