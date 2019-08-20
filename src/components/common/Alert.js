import React from 'react'
import {
    Box,
    Flex,
    Text
} from '@bigcommerce/big-design'
import {
    ErrorIcon,
    CheckCircleIcon,
    WarningIcon,
} from '@bigcommerce/big-design-icons'


const Alert = (props) => {
    const Icon = (props) => {
        return props.variant === 'danger'
            ? <ErrorIcon {...props} color="danger" />
            : props.variant === 'success'
                ? <CheckCircleIcon color="success" />
                : props.variant === 'warning'
                    ? <WarningIcon color="warning" />
                    : <ErrorIcon color="secondary" />
    }

    return <Box backgroundColor={`${props.variant}10`}
        padding="medium">
        <Flex>
            <Flex.Item>
                <Icon variant={props.variant} />
            </Flex.Item>
            <Flex.Item>
                <Text marginLeft="small">{props.text}</Text>
            </Flex.Item>
        </Flex>
    </Box>
}

export default Alert
