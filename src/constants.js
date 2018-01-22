export const initialState = {}
export const initialResourceState = {
    data: {},
    loading: false,
    error: false
}

const prefix = "@@fetcher"

export const ADD_RESOURCE = `${prefix}/ADD_RESOURCE`
export const MODIFY_RESOURCE = `${prefix}/MODIFY_RESOURCE`
export const REQUEST_RESOURCE = `${prefix}/REQUEST_RESOURCE`
export const FETCH_SUCCESS = `${prefix}/FETCH_SUCCESS`
export const FETCH_ADDITIONAL_SUCCESS = `${prefix}/FETCH_ADDITIONAL_SUCCESS`
export const FETCH_ERROR = `${prefix}/FETCH_ERROR`
export const REMOVE_RESOURCE = `${prefix}/REMOVE_RESOURCE`
