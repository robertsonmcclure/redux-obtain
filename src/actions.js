import * as C from "./constants"

export const addResource = (name, paginationKey) => ({
    type: C.ADD_RESOURCE,
    name,
    paginationKey
})

export const modifyResource = ({ name, dataTransform }) => ({
    type: C.MODIFY_RESOURCE,
    name,
    dataTransform
})

export const requestResource = name => ({ type: C.REQUEST_RESOURCE, name })

export const fetchSuccess = (name, data, acceptResponse) => ({
    type: C.FETCH_SUCCESS,
    name,
    data,
    acceptResponse
})

export const fetchAdditionalSuccess = (name, data) => ({
    type: C.FETCH_ADDITIONAL_SUCCESS,
    name,
    data
})

export const fetchError = (name, error) => ({ type: C.FETCH_ERROR, name, error })

export const removeResource = name => ({ type: C.REMOVE_RESOURCE, name })
