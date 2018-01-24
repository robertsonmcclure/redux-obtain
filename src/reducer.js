import * as C from "./constants"

const createReducer = (initialState, handlers) => (state = initialState, action) =>
    handlers.hasOwnProperty(action.type) ? handlers[action.type](state, action) : state

export const reducer = createReducer(C.initialState, {
    [C.ADD_RESOURCE]: (state, action) => ({
        ...state,
        [action.name]: {
            ...C.initialResourceState,
            paginationKey: action.paginationKey
        }
    }),
    [C.MODIFY_RESOURCE]: (state, action) =>
        state[action.name]
            ? {
                  ...state,
                  [action.name]: {
                      ...state[action.name],
                      data: action.dataTransform
                          ? action.dataTransform(state[action.name].data)
                          : state[action.name].data
                  }
              }
            : state,
    [C.REQUEST_RESOURCE]: (state, action) =>
        state[action.name]
            ? {
                  ...state,
                  [action.name]: {
                      ...state[action.name],
                      loading: true,
                      error: false
                  }
              }
            : state,
    [C.FETCH_SUCCESS]: (state, action) =>
        state[action.name]
            ? {
                  ...state,
                  [action.name]: {
                      ...state[action.name],
                      data: action.acceptResponse
                          ? action.acceptResponse(action.data)
                          : action.data,
                      loading: false,
                      error: false
                  }
              }
            : state,
    [C.FETCH_ADDITIONAL_SUCCESS]: (state, action) => {
        if (!state[action.name]) {
            return state
        }
        const paginationKey = state[action.name].paginationKey
        const newData = action.acceptResponse ? action.acceptResponse(action.data) : action.data
        return {
            ...state,
            [action.name]: {
                ...state[action.name],
                data: {
                    ...newData,
                    [paginationKey]: paginationKey && [
                        ...state[action.name].data[paginationKey],
                        ...newData[paginationKey]
                    ]
                },
                loading: false,
                error: false
            }
        }
    },
    [C.FETCH_ERROR]: (state, action) =>
        state[action.name]
            ? {
                  ...state,
                  [action.name]: {
                      ...state[action.name],
                      data: {},
                      loading: false,
                      error: true
                  }
              }
            : state,
    [C.REMOVE_RESOURCE]: (state, action) => {
        const newState = { ...state }
        delete newState[action.name]
        return newState
    }
})
