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
    [C.MODIFY_RESOURCE]: (state, action) => ({
        ...state,
        [action.name]: state[action.name] && {
            ...state[action.name],
            data: action.dataTransform(state[action.name] && state[action.name].data)
        }
    }),
    [C.REQUEST_RESOURCE]: (state, action) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: {},
            loading: true,
            error: false
        }
    }),
    [C.FETCH_SUCCESS]: (state, action) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: action.acceptResponse ? action.acceptResponse(action.data) : action.data,
            loading: false,
            error: false
        }
    }),
    [C.FETCH_ADDITIONAL_SUCCESS]: (state, action) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: {
                ...action.data,
                [state[action.name].paginationKey]: state[action.name].paginationKey && [
                    ...state[action.name].data[state[action.name].paginationKey],
                    ...action.data[state[action.name].paginationKey]
                ]
            },
            loading: false,
            error: false
        }
    }),
    [C.FETCH_ERROR]: (state, action) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: {},
            loading: false,
            error: true
        }
    }),
    [C.REMOVE_RESOURCE]: (state, action) => ({
        ...state,
        [action.name]: undefined
    })
})