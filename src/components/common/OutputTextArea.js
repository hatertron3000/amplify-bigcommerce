import React from 'react'
import {
    Box,
} from '@bigcommerce/big-design'

const OutputTextArea = (props) => {
    return <Box backgroundColor="secondary10" padding="small" shadow="raised">
        <pre>
            {props.code ? <code>{props.content}</code> : props.content}
        </pre>
    </Box>
}

export default OutputTextArea
