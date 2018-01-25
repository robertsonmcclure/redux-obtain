# Pagination

`redux-obtain` makes a bunch of assumptions about how your endpoint will respond.

1. Pagination details are sent to your endpoint in the request body through a POST request.
2. Sending `offset: 0` and `limit: 100` in the request body will have the endpoint respond with the first 100 results
3. Sending `orderBys: [{ column: 'columnKey', direction: 'ASC' }]` to the endpoint will result in the results being sorted on the column `columnKey` in an Ascending order.
4. The endpoint responds with a `totalCount` field which contains an integer that indicates the total number of entries this paginated resources has.

## Example

```javascript
import React from "react"
import { fetcher } from "redux-obtain"

const LongList = ({ data, loading, error, paginationFunctions }) => {
    if (loading) {
        return <div>Loading</div>
    }
    if (error) {
        return <div>Error</div>
    }
    return (
        <div>
            <button
                onClick={() =>
                    paginationFunctions._loadMoreRows({ startIndex: 100, stopIndex: 300 })
                }
            >
                Load 200 more
            </button>
            <ul>{data.list.map((item, index) => <li key={index}>{item.value}</li>)}</ul>
        </div>
    )
}

const LongListContainer = fetcher({
    name: "LONG_LIST",
    // method: POST is not required because all paginated calls are POST requests
    endpoint: "/long_list",
    paginationKey: "list", // IMPORTANT: the presence of this key is what enables pagination
    defaultOrderBys: []
})

export default LongListContainer
```
