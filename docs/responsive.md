# Responsive

Some endpoints you might want to requery when some data in your redux store changes. Perhaps you have a form (using [Redux Form](https://github.com/erikras/redux-form)) that "controls" another part of the application. Since fetching data is linked to React Component Lifecycle methods, it is possible to trigger a requery by passing `fetcher` a selector. The `fetcher` will make a new request if the result obtained from the selector changes, exactly how the `connect` Higher Order Component rerenders it's wrapped component when any of the props change.

For an example, let's say you have a key called `selectedUserId` in your store, and your web application gives you the ability to change the `selectedUserId`. You have a component called `UserProfile` that you want to display that user's data.

```javascript
import React from "react"
import { fetcher } from "redux-obtain"

const UserProfile = ({ data, loading, error }) => {
    if (loading) {
        return <div>Loading ...</div>
    }
    if (error) {
        return <div>Uh Oh</div>
    }
    return (
        <div>
            <span>
                {data.firstName} {data.lastName}
            </span>
            <span>{data.dateOfBirth}</span>
        </div>
    )
}

const UserProfileContainer = fetcher({
    name: "USER_PROFILE",
    method: "POST",
    endpoint: "/user/details",
    requestBodySelector: state => ({
        selectedUserId: state.selectedUserId
    })
})(UserProfile)

export default UserProfileContainer
```

This `UserProfileContainer` will send a `POST` request to `/user/details` with requestBody: `{ selectedUserId }` whenever that key changes in your redux store.
