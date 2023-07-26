import { config } from "./config"

export const getResourceData = (name, selector) => state => {
    const resource = state[config.reduxStoreName][name]
    if (!resource) return undefined
    return selector ? selector(resource.data) : resource.data
}

export const getMetaData = name => state => {
    const { loading, error } = state[config.reduxStoreName][name] || {}
    return { loading, error }
}
