export let config = {
    requestHeaderSelector: (state: any) => ({
        "Content-Type": "application/json",
        Authorization: `Basic ${state.authentication.token}`
    }),
    reduxStoreName: "resources"
}

export const setupFetcher = (options: any) => {
    config = {
        ...config,
        ...options
    }
}
