import React from 'react'
import { Link } from 'react-router-dom'
import { Tabs, H1 } from '@bigcommerce/big-design'
import './Navigation.css'

const Navigation = (props) => {
    return <><H1>{props.lang.brand}</H1>
        <Tabs activeTab={props.activeTab}>
            {props.modules.map(module =>
                <Tabs.Tab id={module.path} key={module.path}>
                    <Link
                        to={module.path}
                        style={{ textDecoration: 'none' }}
                        className={`navigation-link${props.activeTab === module.path ? `-active` : ''}`}>{module.name}</Link>
                </Tabs.Tab>)}
        </Tabs>

    </>
}

export default Navigation