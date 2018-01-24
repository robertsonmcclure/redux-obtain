# Selectors

Sometimes you have components on the other side of the React Tree that need to know about data you've fetched from the server.

## getResourceData

`getResourceData` is a simple selector that will return the `data` key from the redux store under your resources name.

Usage:

```javascript
import { getResourceData } from "redux-obtain"

export default connect(state => getResourceData("RESOURCE_NAME")(state))(({ data }) => (
    <div>{/* do with it what you will */}</div>
))
```

Advanced Usage:

The second argument is a selector function that gets applied to the `data` key in your resource store.

```
Redux Store: {
    resources: {
        RESOURCE_NAME: {
            data: {
                firstName: 'Henry',
                lastName: 'Williamson'
            },
            loading: false,
            error: false
        }
    }
}
```

```javascript
import { getResourceData } from "redux-obtain"

export default connect(state =>
    getResourceData("RESOURCE_NAME", data => `${data.firstName} ${data.lastName}`)(state)
)(({ data }) => <span>{data /* Henry Williamson */}</span>)
```
