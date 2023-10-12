import React, { Component } from "react"
import { connect } from "react-redux"
import * as actions from "./actions"
import { config } from "./config"
import Promise from "bluebird"
import _ from "lodash"
import getDisplayName from "react-display-name"
import qs from "querystring"

Promise.config({ cancellation: true })

/* valid props: {
        name,
        endpoint,
        method,
        acceptResponse,
        persistResource,
        requestBodySelector,
        defaultOrderBys,
        paginationKey
    }
 */

export const fetcher = (props, extraActions) => WrappedComponent =>
    connect(
        (state, ownProps) => {
            const mergedProps = { ...ownProps, ...props }
            const { name, endpoint, requestBodySelector } = mergedProps

            return {
                ...mergedProps,
                endpoint: typeof endpoint === "function" ? endpoint(state, ownProps) : endpoint,
                requestHeader: config.requestHeaderSelector(state),
                resource: state[config.reduxStoreName][name],
                requestBody: requestBodySelector && requestBodySelector(state, ownProps)
            }
        },
        {
            ...extraActions,
            ...actions
        }
    )(
        class Fetcher extends Component {
            static displayName = `Fetcher(${getDisplayName(WrappedComponent)})`

            componentDidMount() {
                this.props.addResource(this.props.name, this.props.paginationKey)
                this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: config.getOrderBys(this.props.defaultOrderBys),
                    firstLoad: true,
                    requestBody: this.props.requestBody
                })
            }
            componentWillUnmount() {
                this.networkRequest && this.networkRequest.cancel()
                !this.props.persistResource && this.props.removeResource(this.props.name)
            }
            componentDidUpdate(prevProps) {
                if (
                    !_.isEqual(prevProps.requestBody, this.props.requestBody) ||
                    !_.isEqual(prevProps.endpoint, this.props.endpoint)
                ) {
                    this.networkRequest && this.networkRequest.cancel()
                    this.sendNetworkRequest({
                        endpoint: this.props.endpoint,
                        limit: config.paginationInitialLoadLimit,
                        offset: 0,
                        orderBys: config.getOrderBys(this.props.defaultOrderBys),
                        firstLoad: true,
                        requestBody: this.props.requestBody
                    })
                }
            }

            sendNetworkRequest = ({ limit, offset, orderBys, firstLoad, endpoint }) => {
                firstLoad && this.props.requestResource(this.props.name)
                const sort = orderBys.map(
                    item => `${item.direction === "DESC" ? "-" : ""}${item.column}`
                )
                const paginationQuery = this.props.paginationKey
                    ? qs.stringify({ limit, offset, sort })
                    : ""
                const requestMethod = this.props.paginationKey ? "GET" : this.props.method || "GET"
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
                                          ...this.props.requestBody
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
                                .then(data =>
                                    firstLoad
                                        ? this.props.fetchSuccess(
                                              this.props.name,
                                              data,
                                              this.props.acceptResponse
                                          )
                                        : this.props.fetchAdditionalSuccess(
                                              this.props.name,
                                              data,
                                              this.props.acceptResponse
                                          )
                                )
                        } else {
                            return res
                                .text()
                                .then(error => this.props.fetchError(this.props.name, error))
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
                    firstLoad: false
                })
            }
            loadInitialRows = props => {
                return this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: config.getOrderBys(props),
                    firstLoad: true
                })
            }
            render() {
                const {
                    name,
                    endpoint,
                    method,
                    acceptResponse,
                    persistResource,
                    requestBodySelector,
                    defaultOrderBys,
                    paginationKey,
                    resource,
                    ...pt
                } = this.props
                const fetcher = _.pickBy({
                    name,
                    endpoint,
                    method,
                    acceptResponse,
                    persistResource,
                    requestBodySelector,
                    defaultOrderBys,
                    paginationKey
                })

                delete pt.addResource
                delete pt.requestResource
                delete pt.fetchSuccess
                delete pt.fetchAdditionalSuccess
                delete pt.fetchError
                delete pt.removeResource
                delete pt.requestBody
                delete pt.requestHeader
                const paginationFunctions = paginationKey
                    ? {
                          _loadMoreRows: this.loadMoreRows,
                          _loadInitialRows: this.loadInitialRows,
                          totalSize: resource && resource.data.totalCount
                      }
                    : undefined

                return resource ? (
                    <WrappedComponent
                        {...pt}
                        {...resource}
                        paginationFunctions={paginationFunctions}
                        fetcher={fetcher}
                    />
                ) : (
                    <div />
                )
            }
        }
    )
