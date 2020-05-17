import React from 'react';
import { Container } from 'react-bootstrap';
import './style.css';

export const Layout = (props: any) => (
    <Container>
        {props.children}
    </Container>
)

