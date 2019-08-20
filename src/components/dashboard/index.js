import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import { Box } from '@bigcommerce/big-design'
import Navigation from './Navigation'
import StoreInformation from './StoreInformation';

class Dashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }


    render() {
        return <Box padding="large">
            <Navigation style={{ width: '100%', }}
                lang={this.props.lang.Navigation}
                modules={this.props.modules}
                activeTab={this.props.location.pathname} />
            <Route path={'/dashboard/store-information'} render={() =>
                <StoreInformation lang={this.props.lang.StoreInformation} />}
            />
        </Box>
    }
}

export default Dashboard