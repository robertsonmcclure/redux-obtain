import * as actions from "./actions"
import * as C from "./constants"
const React = require("react")
const { Component } = React
const { connect } = require("react-redux")
const Promise = require("bluebird")
const INITIAL_LOAD_LIMIT = 100

Promise.config({ cancellation: true })

const getOrderBys = ({ sortBy, sortDirection }: any) =>
    sortBy &&
    sortDirection &&
    sortBy.map((column: any, index: any) => ({ column, direction: sortDirection[index] }))

interface OrderBys {
    sortBy: string[]
    sortDirection: string[]
}

interface PaginatedFetcher {
    name: string
    endpoint: string | Function
    method: "GET" | "POST" | "PUT" | "DELETE"
    acceptResponse?: Function
    persistResource?: boolean
    requestBodySelector?: Function
    defaultOrderBys: OrderBys
    paginationKey: string
}

export const paginatedFetcher = (
    {
        name,
        endpoint,
        defaultOrderBys,
        persistResource,
        requestBodySelector,
        paginationKey
    }: PaginatedFetcher,
    extraActions: any
) => (WrappedComponent: any) =>
    connect(
        (state: any, ownProps: any) => ({
            endpoint: typeof endpoint === "function" ? endpoint(state, ownProps) : endpoint,
            token: state.authentication.token,
            resource: state[C.REDUX_STORE_NAME][name],
            requestBody: requestBodySelector && requestBodySelector(state, ownProps)
        }),
        {
            ...extraActions,
            ...actions
        }
    )(
        class extends Component {
            componentWillMount() {
                this.props.addResource(name, paginationKey)
            }
            componentDidMount() {
                this.sendNetworkRequest({
                    limit: INITIAL_LOAD_LIMIT,
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
                        limit: INITIAL_LOAD_LIMIT,
                        offset: 0,
                        orderBys: getOrderBys(defaultOrderBys),
                        firstLoad: true,
                        requestBody: nextProps.requestBody
                    })
                }
            }
            sendNetworkRequest = ({ limit, offset, orderBys, firstLoad, requestBody }: any) => {
                firstLoad && this.props.requestResource(name)
                this.networkRequest = new Promise((res: any, rej: any) =>
                    fetch(this.props.endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Basic ${this.props.token}`
                        },
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
                    .then((res: any) => {
                        if (res.status === 200) {
                            return res.json()
                        } else {
                            res.text()
                            throw new Error(`Web Service responded with ${res.status}`)
                        }
                    })
                    .then(
                        (data: any) =>
                            firstLoad
                                ? this.props.fetchSuccess(name, data)
                                : this.props.fetchAdditionalSuccess(name, data)
                    )
                    .catch((error: any) => {
                        console.log(error)
                        return this.props.fetchError(name, error)
                    })
                return this.networkRequest
            }
            loadMoreRows = (indices: any, ui: any) => {
                const { startIndex, stopIndex } = indices
                return this.sendNetworkRequest({
                    limit: stopIndex - startIndex,
                    offset: startIndex,
                    orderBys: getOrderBys(ui),
                    requestBody: this.props.requestBody,
                    firstLoad: false
                })
            }
            loadInitialRows = (props: any) => {
                return this.sendNetworkRequest({
                    limit: INITIAL_LOAD_LIMIT,
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
                delete pt.token
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
