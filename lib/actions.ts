import * as C from "./constants"

export const addResource = (name: string, paginationKey: string) => ({
    type: C.ADD_RESOURCE,
    name,
    paginationKey
})

export const modifyResource = (name: string, dataTransform: Function) => ({
    type: C.MODIFY_RESOURCE,
    name,
    dataTransform
})

export const requestResource = (name: string) => ({ type: C.REQUEST_RESOURCE, name })

export const fetchSuccess = (name: string, data: object, acceptResponse: Function) => ({
    type: C.FETCH_SUCCESS,
    name,
    data,
    acceptResponse
})

export const fetchAdditionalSuccess = (name: string, data: object) => ({
    type: C.FETCH_ADDITIONAL_SUCCESS,
    name,
    data
})

export const fetchError = (name: string, error: object) => ({ type: C.FETCH_ERROR, name, error })

export const removeResource = (name: string) => ({ type: C.REMOVE_RESOURCE, name })
