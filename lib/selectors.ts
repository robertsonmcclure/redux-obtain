import { config } from "./config"

export const getResourceData = (name: string, selector: any) => (state: any) =>
    state[config.reduxStoreName][name]
        ? selector
          ? selector(state[config.reduxStoreName][name].data)
          : state[config.reduxStoreName][name].data
        : undefined
