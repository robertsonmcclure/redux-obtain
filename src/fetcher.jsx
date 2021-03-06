import React, { Component } from "react"
import { connect } from "react-redux"
import * as actions from "./actions"
import * as C from "./constants"
import { config } from "./config"
import Promise from "bluebird"
import _ from "lodash"
import getDisplayName from "react-display-name"
import qs from "querystring"

Promise.config({ cancellation: true })

export const fetcher = (
    {
        name,
        endpoint,
        method,
        acceptResponse,
        persistResource,
        requestBodySelector,
        defaultOrderBys,
        paginationKey
    },
    extraActions
) => WrappedComponent =>
    connect(
        (state, ownProps) => ({
            endpoint: typeof endpoint === "function" ? endpoint(state, ownProps) : endpoint,
            requestHeader: config.requestHeaderSelector(state),
            resource: state[config.reduxStoreName][name],
            requestBody: requestBodySelector && requestBodySelector(state, ownProps)
        }),
        {
            ...extraActions,
            ...actions
        }
    )(
        class Fetcher extends Component {
            static displayName = `Fetcher(${getDisplayName(WrappedComponent)})`
            componentWillMount() {
                this.props.addResource(name, paginationKey)
            }
            componentDidMount() {
                this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: config.getOrderBys(defaultOrderBys),
                    firstLoad: true,
                    requestBody: this.props.requestBody
                })
            }
            componentWillUnmount() {
                this.networkRequest && this.networkRequest.cancel()
                !persistResource && this.props.removeResource(name)
            }
            componentWillReceiveProps(nextProps) {
                if (
                    !_.isEqual(this.props.requestBody, nextProps.requestBody) ||
                    !_.isEqual(this.props.endpoint, nextProps.endpoint)
                ) {
                    this.networkRequest && this.networkRequest.cancel()
                    this.sendNetworkRequest({
                        endpoint: nextProps.endpoint,
                        limit: config.paginationInitialLoadLimit,
                        offset: 0,
                        orderBys: config.getOrderBys(defaultOrderBys),
                        firstLoad: true,
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({
                limit,
                offset,
                orderBys,
                firstLoad,
                requestBody,
                endpoint
            }) => {
                firstLoad && this.props.requestResource(name)
                const paginationBody = paginationKey ? { limit, offset, orderBys } : {}
                const sort = orderBys.map(
                    item => `${item.direction === "DESC" ? "-" : ""}${item.column}`
                )
                const paginationQuery = paginationKey ? qs.stringify({ limit, offset, sort }) : ""
                const requestMethod = paginationKey ? "GET" : method
                const requestEndpoint = endpoint || this.props.endpoint
                this.networkRequest = new Promise((res, rej) =>
                    fetch(
                        `${requestEndpoint}${
                            requestEndpoint.indexOf("?") === -1 ? "?" : "&"
                        }${paginationQuery}`,
                        {
                            method: requestMethod,
                            headers: this.props.requestHeader,
                            credentials: "include",
                            body:
                                requestMethod !== "GET"
                                    ? JSON.stringify({
                                          ...requestBody
                                      })
                                    : undefined
                        }
                    )
                        .then(x => res(x))
                        .catch(e => rej(e))
                )
                    .then(res => {
                        if (res.status === 200) {
                            return res
                                .json()
                                .then(
                                    data =>
                                        firstLoad
                                            ? this.props.fetchSuccess(name, data, acceptResponse)
                                            : this.props.fetchAdditionalSuccess(
                                                  name,
                                                  data,
                                                  acceptResponse
                                              )
                                )
                        } else {
                            return res.text().then(error => this.props.fetchError(name, error))
                        }
                    })
                    .catch(e => console.error(e))
                return this.networkRequest
            }
            loadMoreRows = (indices, ui) => {
                const { startIndex, stopIndex } = indices
                return this.sendNetworkRequest({
                    limit: stopIndex - startIndex,
                    offset: startIndex,
                    orderBys: config.getOrderBys(ui),
                    requestBody: this.props.requestBody,
                    firstLoad: false
                })
            }
            loadInitialRows = props => {
                return this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: config.getOrderBys(props),
                    requestBody: this.props.requestBody,
                    firstLoad: true
                })
            }
            render() {
                let pt = { ...this.props }
                delete pt.endpoint
                delete pt.addResource
                delete pt.requestResource
                delete pt.fetchSuccess
                delete pt.fetchAdditionalSuccess
                delete pt.fetchError
                delete pt.removeResource
                delete pt.requestBody
                delete pt.requestHeader
                delete pt.resource
                const paginationFunctions = paginationKey
                    ? {
                          _loadMoreRows: this.loadMoreRows,
                          _loadInitialRows: this.loadInitialRows,
                          totalSize: this.props.resource && this.props.resource.data.totalCount
                      }
                    : undefined
                return this.props.resource ? (
                    <WrappedComponent
                        {...pt}
                        {...this.props.resource}
                        paginationFunctions={paginationFunctions}
                    />
                ) : (
                    <div />
                )
            }
        }
    )
