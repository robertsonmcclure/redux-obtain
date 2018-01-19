import * as actions from "./actions"
import * as C from "./constants"
import { config } from "./config"
const React = require("react")
const { Component } = React
const { connect } = require("react-redux")
const Promise = require("bluebird")
const _ = require("lodash")
const getDisplayName = require("react-display-name")

Promise.config({ cancellation: true })

interface Fetcher {
    name: string
    endpoint: string | Function
    method: "GET" | "POST" | "PUT" | "DELETE"
    acceptResponse?: Function
    persistResource?: boolean
    requestBodySelector?: Function
}

export const fetcher = (
    { name, endpoint, method, acceptResponse, persistResource, requestBodySelector }: Fetcher,
    extraActions: any
) => (WrappedComponent: any) =>
    connect(
        (state: any, ownProps: any) => ({
            endpoint: typeof endpoint === "function" ? endpoint(state, ownProps) : endpoint,
            requestHeader: config.requestHeaderSelector(state),
            resource: state[config.reduxStoreName][name],
            requestBody: requestBodySelector && requestBodySelector(state)
        }),
        {
            ...extraActions,
            ...actions
        }
    )(
        class Fetcher extends Component {
            static displayName = `Fetcher(${getDisplayName.default(WrappedComponent)})`
            componentWillMount() {
                this.props.addResource(name)
            }
            componentDidMount() {
                this.sendNetworkRequest({ requestBody: this.props.requestBody })
            }
            componentWillUnmount() {
                this.networkRequest && this.networkRequest.cancel()
                !persistResource && this.props.removeResource(name)
            }
            componentWillReceiveProps(nextProps: any) {
                if (!_.isEqual(this.props.requestBody, nextProps.requestBody)) {
                    this.sendNetworkRequest({
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({ requestBody }: any) => {
                this.props.requestResource(name)
                this.networkRequest = new Promise((res: any, rej: any) =>
                    fetch(this.props.endpoint, {
                        method: method,
                        headers: this.props.requestHeader,
                        body: method !== "GET" && JSON.stringify({ filter: requestBody })
                    })
                        .then(x => res(x))
                        .catch(e => rej(e))
                )
                    .then((res: any) => {
                        if (res.status === 200) {
                            return res
                                .json()
                                .then((data: any) =>
                                    this.props.fetchSuccess(name, data, acceptResponse)
                                )
                        } else {
                            return res
                                .text()
                                .then((error: any) => this.props.fetchError(name, error))
                        }
                    })
                    .catch((e: any) => console.error(e))
                return this.networkRequest
            }
            render() {
                let pt = { ...this.props }
                delete pt.addResource
                delete pt.requestResource
                delete pt.fetchSuccess
                delete pt.fetchError
                delete pt.removeResource
                delete pt.requestBody
                delete pt.requestHeader
                delete pt.resource
                return this.props.resource ? (
                    <WrappedComponent {...pt} {...this.props.resource} />
                ) : (
                    <div />
                )
            }
        }
    )
