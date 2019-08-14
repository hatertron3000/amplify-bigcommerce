import React, { Component } from 'react'
import { Spinner } from 'react-bootstrap'
import { Redirect } from 'react-router-dom'
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
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </div>
                </div>
                : null}
            {this.state.error
                ? <div className="alert alert-warning" role="alert">
                    Error loading the app
                </div>
                : this.state.load_success
                    ? <Redirect to="/dashboard/store-information" />
                    : null}
        </div>
    }

}

export default Load
