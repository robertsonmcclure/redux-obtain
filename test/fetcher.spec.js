import React, { Component } from "react"
import { Provider } from "react-redux"
import { createStore, combineReducers } from "redux"
import { shallow, mount } from "enzyme"
import toJson from "enzyme-to-json"
import { fetcher, reducer } from "../src"
import configureStore from "redux-mock-store"
const mockStore = configureStore()
Date.now = jest.fn(() => 42)

const initialStore = {
    authentication: { token: "dummy_token" },
    resources: {
        NAME: {
            data: {},
            loading: false,
            error: false
        }
    },
    stuff: { key: "zero" }
}

const wait = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

describe("Fetcher", () => {
    beforeEach(() => {
        fetch.mockClear()
        fetch = jest.fn().mockImplementation(
            () =>
                new Promise((resolve, reject) => {
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => new Promise((res, rej) => res({ pKey: [1, 2, 3, 4] })),
                        text: () => new Promise((res, rej) => res({ what: "what" }))
                    })
                })
        )
    })
    it("should render empty div if store gets messed with", () => {
        const Container = fetcher({ name: "NAME", endpoint: "/api/endpoint", method: "GET" })(
            () => <div />
        )
        const store = mockStore({ ...initialStore, resources: {} })
        const wrapper = mount(
            <Provider store={store}>
                <Container passthrough="attribute" />
            </Provider>
        )
        expect(toJson(wrapper)).toMatchSnapshot()
    })
    it("should mount, call fetch and dispatch actions", () => {
        const Container = fetcher({ name: "NAME", endpoint: "/api/endpoint", method: "GET" })(
            () => <div />
        )
        const store = mockStore(initialStore)
        const wrapper = mount(
            <Provider store={store}>
                <Container passthrough="attribute" />
            </Provider>
        )
        expect(toJson(wrapper)).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
        expect(fetch.mock.calls).toMatchSnapshot()
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
        expect(fetch.mock.calls).toMatchSnapshot()
    })
    it("should dispatch request on props change", () => {
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "GET",
            requestBodySelector: (_, props) => ({ stuff: props.stuff })
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = mount(<Container store={store} stuff={{ one: "two" }} />)
        wrapper.setProps({ stuff: { four: "five" } })
        expect(fetch.mock.calls).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
        wrapper.setProps({ hi: "shouldnt do anything" })
        expect(fetch.mock.calls).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
    })
    it("should dispatch success", async () => {
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "POST",
            requestBodySelector: (_, props) => ({ stuff: props.stuff })
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = mount(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        expect(store.getActions()).toMatchSnapshot()
    })
    it("should dispatch error", async () => {
        fetch = jest.fn().mockImplementation(
            () =>
                new Promise((resolve, reject) => {
                    resolve({
                        ok: true,
                        status: 400,
                        json: () => new Promise((res, rej) => res({ test: "this" })),
                        text: () => new Promise((res, rej) => res({ server: "error" }))
                    })
                })
        )
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "GET",
            requestBodySelector: (_, props) => ({ stuff: props.stuff })
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = mount(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        expect(store.getActions()).toMatchSnapshot()
    })
    it("should console.error other error", async () => {
        console.error = jest.fn()
        fetch = jest.fn().mockImplementation(
            () =>
                new Promise((resolve, reject) => {
                    reject({
                        message: "Some Crazy Error"
                    })
                })
        )
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "GET",
            requestBodySelector: (_, props) => ({ stuff: props.stuff })
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = mount(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        expect(console.error.mock.calls).toMatchSnapshot()
    })
    it("should use pagination", async () => {
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "POST",
            paginationKey: "pKey"
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = mount(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        expect(fetch.mock.calls).toMatchSnapshot()
    })
    it("should use loadMoreRows", async () => {
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "POST",
            paginationKey: "pKey"
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = shallow(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        wrapper
            .dive()
            .instance()
            .loadMoreRows({ startIndex: 100, stopIndex: 250 })
        expect(fetch.mock.calls).toMatchSnapshot()
        await wait(1000)
        expect(store.getActions()).toMatchSnapshot()
    })
    it("should use loadInitialRows with different orderBys", async () => {
        const Container = fetcher({
            name: "NAME",
            endpoint: state => `/api/${state.stuff.key}`,
            method: "POST",
            paginationKey: "pKey"
        })(() => <div />)
        const store = mockStore(initialStore)
        const wrapper = shallow(<Container store={store} stuff={{ one: "two" }} />)
        await wait(1000)
        wrapper
            .dive()
            .instance()
            .loadInitialRows({ sortBy: ["columnKey"], sortDirection: ["ASC"] })
        expect(fetch.mock.calls).toMatchSnapshot()
    })
})
