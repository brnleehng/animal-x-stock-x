import * as React from "react";
import { Item, Variant } from "../../Market";
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';


export class ItemCard extends React.Component<Item & Variant> {

    private getItemVariantInfo(props: Item & Variant): string {
        if (props.colors && props.colors.length) {
            return props.colors[0];
        }
        return "";
    }

    render() {
        let link = '/market/' + this.props.name.replace(/\s/g, '-');
        return (
            <Card className="mx-auto" style={{ width: '10rem' }}>
            <Card.Img variant="top" src={this.props.image} />
            <Card.Body>
                <Card.Title>{`${this.props.name} (${this.getItemVariantInfo(this.props)})`}</Card.Title>
                <Card.Text>Lowest Ask</Card.Text>
                <Card.Text>{this.props.variants[0].sell}</Card.Text>
                <Card.Link>
                    <Link to={{
                        pathname: `${link}`,
                        state: {
                            itemId: `${this.props._id}`,
                            itemUniqueEntryId: `${this.props.uniqueEntryId}`,
                            itemName: `${this.props.name} (${this.getItemVariantInfo(this.props)})`,
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