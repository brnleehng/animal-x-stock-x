import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import 'bootstrap/dist/css/bootstrap.min.css';
import { TradeCard } from '../Trade/TradeCard';

interface Props {};

interface State {
    trades: any[];
    orders: any[];
};

export interface Order {
    id: string;
    createdTime: Date;
    userId: string;
    itemId: string;
    uniqueEntryId: string;
    state: string;
    orderType: string;
    price: number;
}

export interface Trade {
    _id: string;
    buyer: string;
    seller: string;
    sellerName: string;
    buyerName: string;
    sellerContact: string;
    buyerContact: string;
    askId: string;
    bidId: string;
    state: string;
    askPrice: number;
    bidPrice: number;
    itemId: string;
    uniqueEntryId: string;
    createdTime: Date;
    completionTime: Date;
}

export class Profile extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            trades: [],
            orders: []
        };
    }

    componentDidMount() {
        this.getTrades().then((data: any) => {
            this.setState({ trades: data });
        });

        // this.getOrders().then((data: any) => {
        //     this.setState({ orders: data});
        // });
    }

    // async getOrders() {
    //     const userId = JSON.parse(localStorage.getItem("user")!)._id;
    //     const res = await fetch(`http://localhost:3000/api/v1/accounts/${userId}/orders`, {
    //         method: 'GET',
    //         mode: "cors",
    //         cache: "no-cache",
    //         credentials: "same-origin",
    //         headers: {
    //             'Content-Type': 'application/json'
    //             // 'Content-Type': 'application/x-www-form-urlencoded',
    //         },
    //         redirect: "follow",
    //         referrerPolicy: "no-referrer",
    //     });
    //     return res.json();
    // };

    async getTrades() {
        const userId = JSON.parse(localStorage.getItem("user")!)._id;
        console.log(userId);
        const res = await fetch(`http://localhost:3000/api/v1/trades?userId=${userId}`, {
            method: 'GET',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });
        return res.json();
    }

    render() {
        const tradeList = this.state.trades.map((x) =>{
            let payload = x as Trade;
            return (
                <ListGroup.Item className="mt-2 mb-2 mx-auto d-flex align-items-stretch">
                    <TradeCard {...payload} />
                </ListGroup.Item>
            )
        });
        const username = JSON.parse(localStorage.getItem("user")!).username;
        console.log(this.state.trades)
        return (
            <React.Fragment>
                <p> Username: {username} </p>
                <ListGroup>
                    {tradeList}
                </ListGroup>
            </React.Fragment>
        )
    }
}