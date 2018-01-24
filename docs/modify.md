# Modify

After obtaining a resource from an endpoint, a web application often needs to modify it. This is accomplished by dispatching an action from `redux-obtain`. This action does not call your server, but simply modifies the data in the redux store.

```javascript
import React from "react"
import { connect } from "react-redux"
import { modifyResource } from "redux-obtain"

export default connect(null, modifyResource)(({ modifyResource }) => (
    <button
        onClick={() =>
            modifyResource({
                name: "TODOS",
                dataTransform: data => ({
                    ...data,
                    todos: data.todos.map(item => ({ ...item, checked: false }))
                })
            })
        }
    >
        Uncheck All Todos
    </button>
))
```
