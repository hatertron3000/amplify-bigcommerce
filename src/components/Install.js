import React, { Component } from 'react'
import { Auth } from 'aws-amplify'
import {
    H1,
    Panel,
    Box,
    Button,
    Form,
    Checkbox,
    Text
} from '@bigcommerce/big-design'
import Alert from './common/Alert'

class Install extends Component {
    constructor(props) {
        super(props)
        this.state = {
            code: '',
            scope: '',
            context: '',
            tosChecked: false,
            error: false,
            installation_complete: false,
            disabled: true,
            loading: false,
        }
        this.onClickTOS = this.onClickTOS.bind(this)
        this.onClickSignup = this.onClickSignup.bind(this)
        this.stringGenerator = this.stringGenerator.bind(this)
    }

    componentDidMount() {
        let params = new URLSearchParams(this.props.location.search)
        this.setState({
            code: params.get('code'),
            scope: params.get('scope'),
            context: params.get('context')
        })
    }

    stringGenerator() {
        const length = 16 + Math.floor(Math.random() * 240)
        let string = ''
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-[]{};:.,'
        for (let i = 0; i < length; i++) {
            string += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return string
    }

    async onClickSignup(e) {
        e.preventDefault()
        this.setState({
            loading: true,
        })
        try {
            const username = this.state.context.split('/')[1],
                password = this.stringGenerator()

            const result = await Auth.signUp({
                username,
                password,
                attributes: {
                    name: username
                },
                validationData: [
                    {
                        Name: 'code',
                        Value: this.state.code,
                    },
                    {
                        Name: 'scope',
                        Value: this.state.scope,
                    },
                    {
                        Name: 'context',
                        Value: this.state.context,
                    },
                ]
            })
                .catch(err => console.log(err))

            if (result)
                this.setState({
                    installation_complete: true,
                    loading: false,
                    disabled: true
                })
            else {
                this.setState({
                    error: true,
                    loading: false,
                })
            }
        } catch (err) {
            this.setState({
                error: true,
                disabled: false,
                loading: false
            })
        }


    }

    onClickTOS(e) {
        if (!this.state.loading && !this.state.installation_complete) {
            this.setState({
                tosChecked: e.target.checked,
                disabled: !e.target.checked
            })
        }
    }

    render() {
        return (
            <Box padding="large">
                <H1>{this.props.lang.heading}</H1>
                <Panel>
                    <Text>{this.props.lang.tos_intro}</Text>
                    <Form>
                        <Form.Group>
                            <Checkbox checked={this.state.tosChecked}
                                label={`You agree to the terms of service of the app.`}
                                onChange={this.onClickTOS} />
                            <a href="#"><small>{this.props.lang.view_tos}</small></a>
                        </Form.Group>
                        <Button
                            disabled={this.state.disabled}
                            isLoading={this.state.loading}
                            variant="primary"
                            onClick={this.onClickSignup}
                            actionType="normal"
                            marginBottom="medium">
                            Sign Up
                    </Button>
                    </Form>
                    {this.state.error
                        ? <Alert variant="danger" text={this.props.lang.error} />
                        : null}
                    {this.state.installation_complete
                        ?
                        <Alert variant="success"
                            text={this.props.lang.success} />
                        : null}
                </Panel>
            </Box>
        )
    }
}

export default Install
