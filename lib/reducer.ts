import * as C from "./constants"

const createReducer = (initialState: any, handlers: any) => (state = initialState, action: any) =>
    handlers.hasOwnProperty(action.type) ? handlers[action.type](state, action) : state

export const reducer = createReducer(C.initialState, {
    [C.ADD_RESOURCE]: (state: any, action: any) => ({
        ...state,
        [action.name]: {
            ...C.initialResourceState,
            paginationKey: action.paginationKey
        }
    }),
    [C.MODIFY_RESOURCE]: (state: any, action: any) => ({
        ...state,
        [action.name]: state[action.name] && {
            ...state[action.name],
            data: action.dataTransform(state[action.name] && state[action.name].data)
        }
    }),
    [C.REQUEST_RESOURCE]: (state: any, action: any) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: {},
            loading: true,
            error: false
        }
    }),
    [C.FETCH_SUCCESS]: (state: any, action: any) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: action.acceptResponse ? action.acceptResponse(action.data) : action.data,
            loading: false,
            error: false
        }
    }),
    [C.FETCH_ADDITIONAL_SUCCESS]: (state: any, action: any) => ({
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
    [C.FETCH_ERROR]: (state: any, action: any) => ({
        ...state,
        [action.name]: {
            ...state[action.name],
            data: {},
            loading: false,
            error: true
        }
    }),
    [C.REMOVE_RESOURCE]: (state: any, action: any) => ({
        ...state,
        [action.name]: undefined
    })
})
