import React, { Component } from 'react'
import { API } from 'aws-amplify'
import {
    Panel,
    Flex,
    FlexItem,
    ProgressCircle,
    H2,
    Button,
    Text,
} from '@bigcommerce/big-design'
import OutputTextArea from '../common/OutputTextArea'
import Alert from '../common/Alert'

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

    handleClick() {
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
                <ProgressCircle size={'large'} />
            </div>
            : <Panel marginTop="small">
                <Flex justifyContent="flex-start" flexDirection="row">
                    <FlexItem>
                        <H2>{this.props.lang.heading}</H2>
                    </FlexItem>
                </Flex>
                <Text>{this.props.lang.cta}</Text>
                <Button actionType="normal"
                    isLoading={this.state.disabled}
                    onClick={this.handleClick}
                    marginBottom="medium">{this.props.lang.button}
                </Button>
                {this.state.error
                    ? <Alert variant="danger" text={this.props.lang.error} />
                    : null}
                {this.state.information
                    ? <OutputTextArea content={JSON.stringify(this.state.information, null, 2)}
                        code={true} />
                    : null}
            </Panel>
    }
}



export default StoreInformation