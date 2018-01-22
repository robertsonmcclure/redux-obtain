import React, { Component } from "react"
import { connect } from "react-redux"
import * as actions from "./actions"
import * as C from "./constants"
import { config } from "./config"
import Promise from "bluebird"
import _ from "lodash"
import getDisplayName from "react-display-name"

Promise.config({ cancellation: true })

export const fetcher = (
    { name, endpoint, method, acceptResponse, persistResource, requestBodySelector },
    extraActions
) => WrappedComponent =>
    connect(
        (state, ownProps) => ({
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
            static displayName = `Fetcher(${getDisplayName(WrappedComponent)})`
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
            componentWillReceiveProps(nextProps) {
                if (!_.isEqual(this.props.requestBody, nextProps.requestBody)) {
                    this.sendNetworkRequest({
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({ requestBody }) => {
                this.props.requestResource(name)
                this.networkRequest = new Promise((res, rej) =>
                    fetch(this.props.endpoint, {
                        method: method,
                        headers: this.props.requestHeader,
                        body: method !== "GET" && JSON.stringify(requestBody)
                    })
                        .then(x => res(x))
                        .catch(e => rej(e))
                )
                    .then(res => {
                        if (res.status === 200) {
                            return res
                                .json()
                                .then(data => this.props.fetchSuccess(name, data, acceptResponse))
                        } else {
                            return res.text().then(error => this.props.fetchError(name, error))
                        }
                    })
                    .catch(e => console.error(e))
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
