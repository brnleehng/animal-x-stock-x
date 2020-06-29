import * as React from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface Props {
    imageUri: string,
    name: string,
    uniqueEntryId: string
    lowestPrice: number
};

interface State {
    showAskModal: boolean,
    showBidModal: boolean
};

export class Search extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
    };

    render() {

        return (
            <Container>
            </Container>
        )
    }

}