import * as C from "./constants"

export const addResource = ({ name, paginationKey }: any) => ({
    type: C.ADD_RESOURCE,
    name,
    paginationKey
})

export const modifyResource = ({ name, dataTransform }: any) => ({
    type: C.MODIFY_RESOURCE,
    name,
    dataTransform
})

export const requestResource = ({ name }: any) => ({ type: C.REQUEST_RESOURCE, name })

export const fetchSuccess = ({ name, data, acceptResponse }: any) => ({
    type: C.FETCH_SUCCESS,
    name,
    data,
    acceptResponse
})

export const fetchAdditionalSuccess = ({ name, data }: any) => ({
    type: C.FETCH_ADDITIONAL_SUCCESS,
    name,
    data
})

export const fetchError = ({ name }: any) => ({ type: C.FETCH_ERROR, name })

export const removeResource = ({ name }: any) => ({ type: C.REMOVE_RESOURCE, name })
