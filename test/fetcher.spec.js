import React, { Component } from "react"
import { Provider } from "react-redux"
import { createStore, combineReducers } from "redux"
import { shallow, mount } from "enzyme"
import toJson from "enzyme-to-json"
import { fetcher, reducer } from "../src"
import configureStore from "redux-mock-store"
const mockStore = configureStore()
Date.now = jest.fn(() => 42)
global.fetch = require("jest-fetch-mock")

const initialStore = {
    authentication: { token: "dummy_token" },
    resources: {}
}

describe("Fetcher", () => {
    it("should mount, call fetch and dispatch actions", () => {
        const Container = fetcher({ name: "NAME", endpoint: "/api/endpoint", method: "GET" })(
            () => <div />
        )
        const store = mockStore(initialStore)
        const wrapper = mount(
            <Provider store={store}>
                <Container />
            </Provider>
        )
        expect(toJson(wrapper)).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
    })
    it("should dispatch unmount action on unmount", () => {
        const Container = fetcher({ name: "NAME", endpoint: "/api/endpoint", method: "GET" })(
            () => <div />
        )
        const store = mockStore(initialStore)
        const wrapper = mount(
            <Provider store={store}>
                <Container />
            </Provider>
        )
        wrapper.unmount()
        expect(store.getActions()).toMatchSnapshot()
    })
})
