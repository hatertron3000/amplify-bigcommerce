import React, { Component } from 'react'
import { Auth } from 'aws-amplify'
import { Form, Container, Alert, Button } from 'react-bootstrap'

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
        this.setState({
            disabled: true
        })
        const result = await Auth.signUp({
            username: this.state.context.split('/')[1],
            password: this.stringGenerator(),
            attributes: {
                name: this.state.context.split('/')[1]
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
            })
        else {
            this.setState({
                error: 'Error during installation'
            })
        }
    }

    onClickTOS(e) {
        this.setState({
            tosChecked: e.target.checked,
            disabled: !e.target.checked
        })
    }

    render() {
        return (
            <Container>
                <h1>
                    Thank you for installing the app.
                </h1>
                {this.state.error
                    ? <Alert variant="warning">
                        Error during installation
                    </Alert>
                    : null}
                {this.state.installation_complete
                    ? <Alert variant="success">
                        <Alert.Heading>Installation Complete</Alert.Heading>
                        Please close and reopen the app to begin using it.
                    </Alert>
                    : null}
                <Form>
                    Check this box to agree to the terms of service. Consider adding a form here to gather additional information.
                    <Form.Group controlId="tosInpt">
                        <Form.Check
                            type="checkbox"
                            id="tos">
                            <Form.Check.Input type="checkbox" onClick={this.onClickTOS} />
                            <Form.Check.Label>You agree to the <a href="#">terms of service</a> of the app.</Form.Check.Label>
                        </Form.Check>

                    </Form.Group>
                    <Button
                        disabled={this.state.disabled}
                        onClick={this.onClickSignup}
                        variant="primary">
                        Sign Up
                    </Button>
                </Form>
            </Container >
        )
    }
}

export default Install
