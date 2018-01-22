import React, { Component } from "react"
import { connect } from "react-redux"
import * as actions from "./actions"
import * as C from "./constants"
import { config } from "./config"
import Promise from "bluebird"
import _ from "lodash"
import getDisplayName from "react-display-name"

Promise.config({ cancellation: true })

const getOrderBys = ({ sortBy, sortDirection }) =>
    sortBy &&
    sortDirection &&
    sortBy.map((column, index) => ({ column, direction: sortDirection[index] }))

export const paginatedFetcher = (
    { name, endpoint, defaultOrderBys, persistResource, requestBodySelector, paginationKey },
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
        class PaginatedFetcher extends Component {
            static displayName = `PaginatedFetcher(${getDisplayName(WrappedComponent)})`
            componentWillMount() {
                this.props.addResource(name, paginationKey)
            }
            componentDidMount() {
                this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: getOrderBys(defaultOrderBys),
                    firstLoad: true,
                    requestBody: this.props.requestBody
                })
            }
            componentWillUnmount() {
                this.networkRequest && this.networkRequest.cancel()
                !persistResource && this.props.removeResource(name)
            }
            componentWillReceiveProps(nextProps) {
                if (!_.isEqual(this.props.requestBody, nextProps.requestBody)) {
                    this.sendNetworkRequest({
                        limit: config.paginationInitialLoadLimit,
                        offset: 0,
                        orderBys: getOrderBys(defaultOrderBys),
                        firstLoad: true,
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({ limit, offset, orderBys, firstLoad, requestBody }) => {
                firstLoad && this.props.requestResource(name)
                this.networkRequest = new Promise((res, rej) =>
                    fetch(this.props.endpoint, {
                        method: "POST",
                        headers: this.props.requestHeader,
                        body: JSON.stringify({
                            limit,
                            offset,
                            orderBys,
                            ...requestBody
                        })
                    })
                        .then(x => res(x))
                        .catch(e => rej(e))
                )
                    .then(res => {
                        if (res.status === 200) {
                            return res.json()
                        } else {
                            res.text()
                            throw new Error(`Web Service responded with ${res.status}`)
                        }
                    })
                    .then(
                        data =>
                            firstLoad
                                ? this.props.fetchSuccess(name, data)
                                : this.props.fetchAdditionalSuccess(name, data)
                    )
                    .catch(error => {
                        console.log(error)
                        return this.props.fetchError(name, error)
                    })
                return this.networkRequest
            }
            loadMoreRows = (indices, ui) => {
                const { startIndex, stopIndex } = indices
                return this.sendNetworkRequest({
                    limit: stopIndex - startIndex,
                    offset: startIndex,
                    orderBys: getOrderBys(ui),
                    requestBody: this.props.requestBody,
                    firstLoad: false
                })
            }
            loadInitialRows = props => {
                return this.sendNetworkRequest({
                    limit: config.paginationInitialLoadLimit,
                    offset: 0,
                    orderBys: getOrderBys(props),
                    requestBody: this.props.requestBody,
                    firstLoad: true
                })
            }
            render() {
                let pt = { ...this.props }
                delete pt.addResource
                delete pt.modifyResource
                delete pt.requestResource
                delete pt.fetchSuccess
                delete pt.fetchAdditionalSuccess
                delete pt.fetchError
                delete pt.removeResource
                delete pt.requestBody
                delete pt.requestHeader
                delete pt.resource
                return this.props.resource ? (
                    <WrappedComponent
                        {...pt}
                        {...this.props.resource}
                        paginationFunctions={{
                            _loadMoreRows: this.loadMoreRows,
                            _loadInitialRows: this.loadInitialRows,
                            totalSize: this.props.resource.data.totalCount
                        }}
                    />
                ) : (
                    <div />
                )
            }
        }
    )
