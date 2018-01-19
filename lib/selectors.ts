import * as C from "./constants"

export const getResourceData = (name: string, selector: any) => (state: any) =>
    state[C.REDUX_STORE_NAME][name]
        ? selector
          ? selector(state[C.REDUX_STORE_NAME][name].data)
          : state[C.REDUX_STORE_NAME][name].data
        : undefined
