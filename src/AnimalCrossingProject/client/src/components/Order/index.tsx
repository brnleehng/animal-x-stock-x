import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

interface Props {
    accountId: string,
    itemName: string,
    itemVariant: string,
    itemId: string,
    imagePath: string,
};

interface State  {
    price: number,
    orderType: string
};

export class Order extends React.Component<Props, State> {
    state: State = {
        price: 0,
        orderType: ""
    };

    selectDropDown(value: string) {
        this.setState({ orderType: value });
    }

    render() {
        return (
            <InputGroup className="mb-3">
                <InputGroup.Prepend>
                <InputGroup.Text>Bells</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl />
                <InputGroup.Prepend>
                <InputGroup.Text>Order Type</InputGroup.Text>
                </InputGroup.Prepend>
                <DropdownButton
                    as={InputGroup.Append}
                    variant="outline-secondary"
                    title= {this.state.orderType || "Select Ask or Bid"}
                    id="input-group-dropdown-2"
                    >
                    <Dropdown.Item as="button">
                        <div onClick={(e) => this.selectDropDown((e.target as HTMLElement).textContent!)}>
                            Ask
                        </div>
                    </Dropdown.Item>
                    <Dropdown.Item >
                        <div onClick={(e) => this.selectDropDown((e.target as HTMLElement).textContent!)}>
                            Bid
                        </div>
                    </Dropdown.Item>
                </DropdownButton>
                <Button variant="primary" type="submit">
                Submit Order
                </Button>
            </InputGroup>

        )
    }
}