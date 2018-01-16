export const REDUX_STORE_NAME = "resources"

export const initialState = {}
export const initialResourceState = {
    data: {},
    loading: false,
    error: false
}

export const ADD_RESOURCE = "@@fetcher/ADD_RESOURCE"
export const MODIFY_RESOURCE = "@@fetcher/MODIFY_RESOURCE"
export const REQUEST_RESOURCE = "@@fetcher/REQUEST_RESOURCE"
export const FETCH_SUCCESS = "@@fetcher/FETCH_SUCCESS"
export const FETCH_ADDITIONAL_SUCCESS = "@@fetcher/FETCH_ADDITIONAL_SUCCESS"
export const FETCH_ERROR = "@@fetcher/FETCH_ERROR"
export const REMOVE_RESOURCE = "@@fetcher/REMOVE_RESOURCE"

export const LIST_FILTER_VALUES = [
    "pcps",
    "units",
    "payers",
    "productClasses",
    "acuteEncounters",
    "measures",
    "conditions"
]
