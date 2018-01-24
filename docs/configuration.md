# Configuration

`redux-obtain` makes some basic assumptions about your application, but also allows you to override and customize any of them.

## Request Header Authentication

Most APIs include authentication in Header fields. `redux-obtain` assumes that your endpoint uses the following Header

```
Authorization: `Basic {token}`
```

and that you can retrieve that `token` from your redux store by the following selector `state => state.authentication.token`. If you wish to change this to `state.auth.token` or add a new header, just follow this code snippet.

```javascript
// Should be done in your root file or root reducer.
// Called before anything gets rendered
import { setupFetcher } from "redux-obtain"

setupFetcher({
    requestHeaderSelector: state => ({
        "Content-Type": "application/json",
        Authorization: `Basic ${state.auth.token}`,
        AnotherHeader: "Whatever you want"
    })
})
```

## Redux Store Name

`redux-obtain` assumes that it will be attached to your redux store using the key `resources`. If you wish to change that value,

```javascript
import { createStore, combineReducers } from "redux"
import { reducer as resourceReducer, setupFetcher } from "redux-obtain"

setupFetcher({
    reduxStoreName: "obtainables"
})

const rootReducer = combineReducers({
    obtainables: resourceReducer
})

const store = createStore(rootReducer)
```

## Pagination

When paginating, the initial load value is set to 100 by default. To change this simply call `setupFetcher` with the appropriate argument.

```javascript
import { setupFetcher } from "redux-obtain"

setupFetcher({
    paginationInitialLoadLimit: 200
})
```
