import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import {
    Container,
    Row,
} from 'react-bootstrap'
import Navigation from './Navigation'
import StoreInformation from './StoreInformation';

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }


    render() {
        return <Container fluid={true}
            className="pl-0"
            style={{ position: 'absolute', top: '0%', bottom: '0%', right: '0%', left: '0%', }}>
            <Row id="nav"
                noGutters={true}>
                <Navigation style={{ width: '100%', }} />
            </Row>
            <Row noGutters={true} style={{ height: '100%' }}>
                <Route path={'/dashboard/store-information'} render={() =>
                    <StoreInformation {...this.props} />}
                />
            </Row>
        </Container>
    }
}

export default Dashboard