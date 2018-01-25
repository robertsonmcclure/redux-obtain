import { fetcher } from "./fetcher"
import { modifyResource } from "./actions"
import { getResourceData, getMetaData } from "./selectors"
import { reducer } from "./reducer"
import { setupFetcher } from "./config"

export { fetcher, modifyResource, getResourceData, getMetaData, reducer, setupFetcher }
