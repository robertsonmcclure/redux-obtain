import { config } from "./config"

export const getResourceData = (name, selector) => state =>
    state[config.reduxStoreName][name]
        ? selector
          ? selector(state[config.reduxStoreName][name].data)
          : state[config.reduxStoreName][name].data
        : undefined

export const getMetaData = name => state => ({
    loading: state[config.reduxStoreName][name].loading,
    error: state[config.reduxStoreName][name].error
})
