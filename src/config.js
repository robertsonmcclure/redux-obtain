export let config = {
    requestHeaderSelector: state => ({
        "Content-Type": "application/json",
        Authorization: `Basic ${state.authentication.token}`
    }),
    reduxStoreName: "resources",
    paginationInitialLoadLimit: 500,
    getOrderBys: props =>
        props && props.sortBy && props.sortDirection
            ? props.sortBy.map((column, index) => ({
                  column,
                  direction: props.sortDirection[index]
              }))
            : []
}

export const setupFetcher = options => {
    config = {
        ...config,
        ...options
    }
}
