import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'

const Navigation = (props) => {
    return <Navbar bg="dark" variant="dark" style={props.style}>
        <Navbar.Brand>Example App</Navbar.Brand>
        <Nav>
            <Nav.Link href={`/dashboard${process.env.REACT_APP_STOREINFORMATIONPATH}`}>Store Info</Nav.Link>
        </Nav>
    </Navbar>
}

export default Navigation