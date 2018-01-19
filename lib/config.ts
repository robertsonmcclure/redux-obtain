export const config = {
    tokenSelector: (state: any) => state.authentication.token
}

export const setupFetcher = (options: any) => {
    config.tokenSelector = options.tokenSelector || config.tokenSelector
}
