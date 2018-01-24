import { fetcher } from "./fetcher"
import { paginatedFetcher } from "./paginatedFetcher"
import { modifyResource } from "./actions"
import { getResourceData, getMetaData } from "./selectors"
import { reducer } from "./reducer"
import { setupFetcher } from "./config"

export {
    fetcher,
    paginatedFetcher,
    modifyResource,
    getResourceData,
    getMetaData,
    reducer,
    setupFetcher
}
