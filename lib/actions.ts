import * as C from "./constants"

export const addResource = (name: string, paginationKey?: string) => ({
    type: C.ADD_RESOURCE,
    name,
    paginationKey
})

export const modifyResource = ({ name, dataTransform }: any) => ({
    type: C.MODIFY_RESOURCE,
    name,
    dataTransform
})

export const requestResource = (name: string) => ({ type: C.REQUEST_RESOURCE, name })

export const fetchSuccess = (name: string, data: any, acceptResponse: any) => ({
    type: C.FETCH_SUCCESS,
    name,
    data,
    acceptResponse
})

export const fetchAdditionalSuccess = (name: string, data: any) => ({
    type: C.FETCH_ADDITIONAL_SUCCESS,
    name,
    data
})

export const fetchError = (name: any, error: any) => ({ type: C.FETCH_ERROR, name, error })

export const removeResource = (name: any) => ({ type: C.REMOVE_RESOURCE, name })
