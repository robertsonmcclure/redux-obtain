export let config = {
    requestHeaderSelector: state => ({
        "Content-Type": "application/json",
        Authorization: `Basic ${state.authentication.token}`
    }),
    reduxStoreName: "resources",
    paginationInitialLoadLimit: 100
}

export const setupFetcher = options => {
    config = {
        ...config,
        ...options
    }
}
