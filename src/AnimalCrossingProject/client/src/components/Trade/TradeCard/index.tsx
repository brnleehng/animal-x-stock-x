import * as React from "react";
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Trade } from '../../Profile';
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';

interface State {
    itemName: string;
    itemImage: string;
    itemColors: any[];
}

export class TradeCard extends React.Component<Trade, State> {
    constructor(props: Trade) {
        super(props);
        this.state = {
            itemName: "",
            itemImage: "",
            itemColors: []
        }
        console.log(props);
    }

    componentDidMount() {
        this.getItem(this.props.itemId).then(data => {
            let aVariant = null;
            console.log(data);
            for (const variant of data.variants) {
                if (variant.uniqueEntryId === this.props.uniqueEntryId) {
                    aVariant = variant;
                }
            }

            let color = "";
            if (aVariant) {
                if (aVariant.colors && aVariant.colors.length) {
                    color = aVariant.colors[0];
                }
            }

            if (color) {
                this.setState({ itemName: `${data.name} (${color})`, itemImage: aVariant.image });
            } else {
                this.setState({ itemName: data.name, itemImage: aVariant.image });
            }
        });
    }

    async getItem(itemId: string) {
        const res = await fetch(`http://localhost:3000/api/v1/items/${itemId}`, {
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

    render() {
        let link = `/market/${this.state.itemName.replace(/\s/g, '-').replace(/\(|\)/g, '')}`;
        return (
            <React.Fragment>
                <ListGroup.Item><Image src={this.state.itemImage}/></ListGroup.Item>
                <ListGroup.Item>Item: {this.state.itemName}</ListGroup.Item>
                <ListGroup.Item>Matched Price: {this.props.bidPrice}</ListGroup.Item>
                <ListGroup.Item>SellerName: {this.props.sellerName}</ListGroup.Item>
                <ListGroup.Item>SellerContact: {this.props.sellerContact}</ListGroup.Item>
                <ListGroup.Item>SellerName: {this.props.buyerName}</ListGroup.Item>
                <ListGroup.Item>SellerContact: {this.props.buyerContact}</ListGroup.Item>

                <ListGroup.Item>
                    <Link to={{
                        pathname: `${link}`,
                        state: {
                            itemId: `${this.props.itemId}`,
                            itemUniqueEntryId: `${this.props.uniqueEntryId}`,
                            itemName: `${this.state.itemName}`,
                            itemVariant: ``,
                            itemImage: `${this.state.itemImage}`
                        }
                    }}>Buy</Link>
                </ListGroup.Item>
            </React.Fragment>
        )
    }
}