import * as actions from "./actions"
import * as C from "./constants"
const React = require("react")
const { Component } = React
const { connect } = require("react-redux")
const Promise = require("bluebird")

Promise.config({ cancellation: true })

export const fetcher = (
    { name, endpoint, method, acceptResponse, persistResource, requestBodySelector }: any,
    extraActions: any
) => (WrappedComponent: any) =>
    connect(
        (state: any, ownProps: any) => ({
            endpoint: typeof endpoint === "function" ? endpoint(state, ownProps) : endpoint,
            token: state.authentication.token,
            resource: state[C.REDUX_STORE_NAME][name],
            requestBody: requestBodySelector && requestBodySelector(state)
        }),
        {
            ...extraActions,
            ...actions
        }
    )(
        class extends Component {
            componentWillMount() {
                this.props.addResource({ name })
            }
            componentDidMount() {
                this.sendNetworkRequest({ requestBody: this.props.requestBody })
            }
            componentWillUnmount() {
                this.networkRequest && this.networkRequest.cancel()
                !persistResource && this.props.removeResource({ name })
            }
            componentWillReceiveProps(nextProps: any) {
                const differentFilter =
                    nextProps.requestBody &&
                    Object.keys(nextProps.requestBody).reduce((acc, key) => {
                        if (C.LIST_FILTER_VALUES.indexOf(key) !== -1) {
                            return (
                                acc ||
                                (this.props.requestBody[key] &&
                                    nextProps.requestBody[key] &&
                                    this.props.requestBody[key].length !==
                                        nextProps.requestBody[key].length)
                            )
                        } else {
                            return acc || this.props.requestBody[key] !== nextProps.requestBody[key]
                        }
                    }, false)
                if (differentFilter) {
                    this.sendNetworkRequest({
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({ requestBody }: any) => {
                this.props.requestResource({ name })
                this.networkRequest = new Promise((res: any, rej: any) =>
                    fetch(this.props.endpoint, {
                        method: method,
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Basic ${this.props.token}`
                        },
                        body: method !== "GET" && JSON.stringify({ filter: requestBody })
                    })
                        .then(x => res(x))
                        .catch(e => rej(e))
                )
                    .then((res: any) => {
                        if (res.status === 200) {
                            return res.json()
                        } else {
                            throw new Error(`Web Service responded with ${res.status}`)
                        }
                    })
                    .then((data: any) => this.props.fetchSuccess({ name, data, acceptResponse }))
                    .catch((error: any) => {
                        console.log(error)
                        return this.props.fetchError({ name, error })
                    })
                return this.networkRequest
            }
            render() {
                let pt = { ...this.props }
                delete pt.addResource
                delete pt.requestResource
                delete pt.fetchSuccess
                delete pt.fetchError
                delete pt.removeResource
                delete pt.token
                delete pt.resource
                return this.props.resource ? (
                    <WrappedComponent {...pt} {...this.props.resource} />
                ) : (
                    <div />
                )
            }
        }
    )
