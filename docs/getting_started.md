# Getting Started

## Step 1

The store should know how to handle actions coming from the Fetcher components. To enable this, we need to pass the resourceReducer to your store. It serves for all of your Fetcher components, so you only have to pass it once.

```javascript
import { createStore, combineReducers } from "redux"
import { reducer as resourceReducer } from "redux-obtain"

const rootReducer = combineReducers({
    // ...your other reducers here
    // you have to pass formReducer under 'resources' key,
    // for custom keys look up the docs for configuring redux-obtain
    resources: resourceReducer
})

const store = createStore(rootReducer)
```

_NOTE_: The key used to pass the redux-obtain reducer should be named `resources`. If you need a custom key for some reason see [Configuring reduxStoreName](configuration.md) for details.

## Step 2

Wrap a component with `fetcher` to hook up it's lifecycle to `redux-obtain`.

```javascript
import React from "react"
import { fetcher } from "redux-obtain"
import TodoList from "./TodoList"

const TodoListContainer = fetcher({
    name: "TODOS",
    method: "GET",
    endpoint: "/todos"
})(TodoList)

export default TodoListContainer
```

## Step 3

Access the data in your wrapped component. _Assuming the endpoint `/todos` returns a response that looks like `{ todos: [ { id: 1, text: "Hello World!" }, { id: 2, text: "Get Milk" }]}`_

```javascript
import React from "react"

const TodoList = ({ data: { todos }, loading, error }) => {
    if (loading) {
        return <div>Loading ...</div>
    }
    if (error) {
        return <div>An error has occured</div>
    }
    return <ul>{todos && todos.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>
}

export default TodoList
```
