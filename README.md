# Redux Obtain

`redux-obtain` works with [React Redux](https://github.com/rackt/react-redux) to
coordinate getting data from a server using [React](https://github.com/facebook/react) component lifecycles to manage the asychronous actions and
[Redux](https://github.com/rackt/redux) to store all of its state.

[![Build Status](https://travis-ci.org/robertsonmcclure/redux-obtain.svg?branch=master)](https://travis-ci.org/robertsonmcclure/redux-obtain) [![codecov](https://codecov.io/gh/robertsonmcclure/redux-obtain/branch/master/graph/badge.svg)](https://codecov.io/gh/robertsonmcclure/redux-obtain) [![npm](https://img.shields.io/npm/dw/localeval.svg)](https://www.npmjs.com/package/redux-obtain) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Installation

```
npm install --save redux-obtain
```

or if you prefer `yarn`

```
yarn add redux-obtain
```

## Usage

First, hook up `redux-obtain` into your root reducer:

```javascript
import { createStore, combineReducers } from "redux"
import { reducer as resourceReducer } from "redux-obtain"

const rootReducer = combineReducers({
    // ...your other reducers here
    resources: resourceReducer
})

const store = createStore(rootReducer)
```

Then use a `fetcher` component to obtain some data

```javascript
import React from "react"
import { fetcher } from "redux-obtain"

const TodoList = ({ data: { todos }, loading, error }) =>
    loading ? (
        <div>Loading</div>
    ) : error ? (
        <div>Error</div>
    ) : (
        <ul>{todos && todos.map((item, index) => <li key={index}>{item.text}</li>)}</ul>
    )

export default fetcher({
    name: "TODO_LIST",
    endpoint: "/todos",
    method: "GET"
})(TodoList)
```

It's as simple as that! `redux-obtain` will manage fetching/storing/removing all the data from your redux store for you.

## Fetcher Options

| Option                | Required | Type               | Default                             | Purpose                                                                                                                                     |
| --------------------- | -------- | ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                | YES      | String             |                                     | This is the unique name given to the resource. It is required to access it                                                                  |
| `endpoint`            | YES      | String or Selector |                                     | The endpoint to call for the resource. A redux store selector can be used for a dynamic endpoint.                                           |
| `method`              | YES      | http method        |                                     | Method to call endpoint                                                                                                                     |
| `paginationKey`       | NO       | String             | `undefined`                         | If given, this enables [pagination](docs/pagination.md). The presence of this option overrides `method`, setting it to POST.                |
| `requestBodySelector` | NO       | Selector           | `() => undefined`                   | Selects the request body from the redux store. Will trigger a Request for data if the result of the selector changes.                       |
| `persistResource`     | NO       | Boolean            | `false`                             | If given, the resource will not remove itself from the store on unmount.                                                                    |
| `defaultOrderBys`     | NO       | Object             | `{ sortBy: [], sortDirection: [] }` | Used for paginated resources. This is the ordering that will be sent with the first request.                                                |
| `acceptResponse`      | NO       | Selector           | `x => x`                            | This is applied to the response from the server, before it is saved to the redux store. Normalization / Transformation should be done here. |

## Documentation

* [Getting Started](docs/getting_started.md)
* [Modifying the State](docs/modify.md)
* [Configuration](docs/configuration.md)
* [Responsive Endpoints](docs/responsive.md)
* [Pagination](docs/pagination.md)
* [Selectors](docs/selectors.md)

## License

MIT
