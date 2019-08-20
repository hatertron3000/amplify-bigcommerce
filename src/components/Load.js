import React, { Component } from 'react'
import { ProgressCircle, Box } from '@bigcommerce/big-design'
import { Redirect } from 'react-router-dom'
import Alert from './common/Alert'
import { Auth } from 'aws-amplify'

class Load extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: false,
            payload: {},
            loading: true,
            load_success: false
        }
    }

    componentDidMount() {
        let params = new URLSearchParams(this.props.location.search)
        const signedPayload = params.get('signed_payload')
        if (!signedPayload)
            this.setState({
                error: true
            })
        else {
            try {
                const splitPayload = signedPayload.split('.')
                const encodedPayload = splitPayload[0]
                const buff = new Buffer(encodedPayload, 'base64')
                const string = buff.toString('utf8')
                const payload = JSON.parse(string)
                this.setState({
                    payload
                }, () => {
                    Auth.signIn(this.state.payload.store_hash)
                        .then(user => {
                            if (user.challengeName === 'CUSTOM_CHALLENGE')
                                Auth.sendCustomChallengeAnswer(user, signedPayload)
                                    .then(user => {
                                        this.setState({
                                            loading: false,
                                            load_success: true
                                        })
                                    })
                                    .catch(err => {
                                        console.log(err)
                                        this.setState({
                                            error: true
                                        })
                                    })
                        })
                        .catch(err => {
                            console.log(err)
                            this.setState({
                                error: true
                            })
                        })
                })
            }
            catch (err) {
                this.setState({
                    error: true
                })
            }
        }
    }

    render() {
        return <div className="row">
            {this.state.loading && !this.state.error
                ? <div className="fullscreen">
                    <div className="centered">
                        <ProgressCircle size="large" />
                    </div>
                </div>
                : null}
            {this.state.error
                ? <Box padding="large">
                    <Alert variant="warning"
                        text={this.props.lang.error} />
                </Box>
                : this.state.load_success
                    ? <Redirect to="/dashboard/store-information" />
                    : null}
        </div>
    }
}

export default Load
