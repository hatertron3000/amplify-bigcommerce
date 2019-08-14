import React, { Component } from 'react'
import { API } from 'aws-amplify'
import {
    Card,
    Button,
    Alert,
    Spinner,
    Container,
    Row,
    Col
} from 'react-bootstrap'

class StoreInformation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            information: null,
            loading: true,
            error: false,
            disabled: false,
        }

        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        this.setState({ loading: false })
    }

    handleClick(event) {
        this.setState({ disabled: true })
        API.get(process.env.REACT_APP_BCAPI, process.env.REACT_APP_STOREINFORMATIONPATH)
            .then(res => {
                if (!res.data.id)
                    this.setState({ error: true })
                else
                    this.setState({
                        information: res.data,
                        disabled: false
                    })
            })
            .catch(err => {
                console.error(err)
                this.setState({ error: true })
                this.setState({ disabled: false })
            })
    }

    render() {
        return this.state.loading
            ? <div className="centered">
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </div>
            : <Container>
                <Row noGutters={true}>
                    <Col></Col>
                    <Col xs={10}>
                        <Card bg="light"
                            variant="light"
                            className="shadow"
                            style={{ 'marginTop': '1rem' }}>
                            <Card.Header>
                                <Card.Title>
                                    Get Store Information
                </Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    Click the button to get store information:
                    </Card.Text>
                                <Button variant="dark" onClick={this.handleClick}>Get Information</Button>
                            </Card.Body>
                            <Card.Footer>
                                {this.state.error
                                    ? <Alert variant="warning" dismissable>
                                        Error retrieving store information
                                            </Alert>
                                    : null}
                                {this.state.information
                                    ? <pre style={{ 'max-height': '100%' }}>
                                        <code>
                                            {JSON.stringify(this.state.information, null, 2)}
                                        </code>
                                    </pre>
                                    : null}
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col></Col>
                </Row>
            </Container>
    }
}

export default StoreInformation