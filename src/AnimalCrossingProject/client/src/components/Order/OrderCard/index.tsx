import * as React from "react";
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Order } from '../../Profile';
import ListGroup from 'react-bootstrap/ListGroup';
import Image from 'react-bootstrap/Image';

interface Props {
    itemImage: string;
}

interface State {
    itemName: string;
    itemImage: string;
    itemColors: any[];
}

export class OrderCard extends React.Component<Order & Props, State> {
    constructor(props: Order & Props) {
        super(props);
        this.state = {
            itemName: "",
            itemImage: "",
            itemColors: []
        }
        console.log(props);
    }

    componentDidMount() {
    }


    render() {
        let link = `/market/${this.state.itemName.replace(/\s/g, '-').replace(/\(|\)/g, '')}`;
        return (
            <React.Fragment>
                <ListGroup.Item><Image src={this.state.itemImage}/></ListGroup.Item>
                <ListGroup.Item>Item: {this.state.itemName}</ListGroup.Item>
                <ListGroup.Item>Price: {this.props.price}</ListGroup.Item>
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