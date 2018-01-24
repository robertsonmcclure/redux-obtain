import { expect } from "chai"
import { reducer } from "../src/reducer"
import * as C from "../src/constants"
import * as actions from "../src/actions"
import {
    modifyResource,
    requestResource,
    fetchSuccess,
    fetchAdditionalSuccess,
    addResource,
    fetchError,
    removeResource
} from "../src/actions"

describe("Reducer", () => {
    describe("init", () => {
        it("should return initial state", () => {
            expect(reducer(undefined, {})).to.deep.equal(C.initialState)
        })
    })
    describe("Add Resource", () => {
        it("should add a resource", () => {
            const NAME = "new_resource"
            expect(reducer(C.initialState, actions.addResource(NAME))).to.deep.equal({
                [NAME]: C.initialResourceState
            })
            expect(Object.keys(reducer(C.initialState, actions.addResource(NAME))).length).to.equal(
                1
            )
        })
        it("should add a multiple resources", () => {
            const first_resource = "first_resource_name"
            const second_resource = "second_resource_name"
            const state1 = C.initialState
            const state2 = reducer(state1, actions.addResource(first_resource))
            const final_state = reducer(state2, actions.addResource(second_resource))
            expect(Object.keys(final_state).length).to.equal(2)
            expect(final_state[first_resource]).to.deep.equal(C.initialResourceState)
            expect(final_state[second_resource]).to.deep.equal(C.initialResourceState)
        })
        it("should add a pagination key", () => {
            const pName = "paginated_resource"
            const pKey = "name_of_attribute_to_be_paginated_on"
            expect(reducer(C.initialState, actions.addResource(pName, pKey))).to.deep.equal({
                [pName]: {
                    loading: false,
                    error: false,
                    data: {},
                    paginationKey: pKey
                }
            })
        })
    })
    describe("Modify Resource", () => {
        it("should do nothing if resource does not exist", () => {
            expect(
                reducer(
                    C.initialState,
                    modifyResource({
                        name: "some_resource_name",
                        dataTransform: data => ({ ...data, list: [1, 2, 3, 4] })
                    })
                )
            ).to.deep.equal(C.initialState)
        })
        it("should do nothing if no dataTransform is given", () => {
            const name = "whatever"
            const state = reducer(C.initialState, actions.addResource(name))
            expect(reducer({ ...state }, modifyResource({ name }))).to.deep.equal({ ...state })
        })
        it("should apply dataTransform", () => {
            const name = "whatever"
            const state = reducer(C.initialState, actions.addResource(name))
            expect(
                reducer(
                    { ...state },
                    modifyResource({
                        name,
                        dataTransform: data => ({ ...data, newKey: "newValue" })
                    })
                )
            ).to.deep.equal({ ...state, [name]: { ...state[name], data: { newKey: "newValue" } } })
        })
    })
    describe("Request Resource", () => {
        it("should do nothing if the resource does not exist", () => {
            const name = "some name"
            expect(reducer(C.initialState, requestResource(name))).to.deep.equal(C.initialState)
        })
        it("should set flags on request", () => {
            const name = "random name"
            const state = {
                [name]: C.initialResourceState
            }
            expect(reducer(state, requestResource(name))).to.deep.equal({
                ...state,
                [name]: { ...state[name], loading: true, error: false }
            })
        })
    })
    describe("Fetch Success", () => {
        it("should do nothing if the resource doesn't exist", () => {
            const name = "some name"
            expect(
                reducer(C.initialState, fetchSuccess(name, { list: [1, 2, 3, 4] }, data => data))
            ).to.deep.equal(C.initialState)
        })
        it("should set the flags correctly", () => {
            const name = "resource name"
            const data = { list: [1, 2, 3, 4] }
            expect(
                reducer({ [name]: C.initialResourceState }, fetchSuccess(name, data))[name].loading
            ).to.equal(false)
            expect(
                reducer({ [name]: C.initialResourceState }, fetchSuccess(name, data))[name].error
            ).to.equal(false)
        })
        it("should set data without dataTransform", () => {
            const name = "resource name"
            const data = {
                list: [1, 2, 3, 4],
                complicated: { nested: ["structure", "and", "a", "half"] }
            }
            expect(
                reducer({ [name]: C.initialResourceState }, fetchSuccess(name, data))[name].data
            ).to.deep.equal(data)
        })
        it("should apply acceptResponse to data", () => {
            const name = "something something name"
            const data = {
                list: [1, 2, 3, 4, 5, 66],
                object: { foo: "bar" }
            }
            const acceptResponse = data => ({ ...data, object: { ...data.object, foo: "baz" } })
            expect(
                reducer(
                    { [name]: C.initialResourceState },
                    fetchSuccess(name, data, acceptResponse)
                )[name].data
            ).to.deep.equal(acceptResponse(data))
        })
    })
    describe("Fetch Additional Success", () => {
        it("should do nothing if the resource does not exist", () => {
            expect(
                reducer(
                    C.initialState,
                    fetchAdditionalSuccess("some name", { list: [1, 2, 3, 4] }, data => data)
                )
            ).to.deep.equal(C.initialState)
        })
        it("should set the flags correctly", () => {
            const name = "eh whatever"
            expect(
                reducer({ [name]: C.initialResourceState }, fetchAdditionalSuccess(name, {}))[name]
                    .loading
            ).to.equal(false)
            expect(
                reducer({ [name]: C.initialResourceState }, fetchAdditionalSuccess(name, {}))[name]
                    .error
            ).to.equal(false)
        })
        it("should append new data onto paginationKey", () => {
            const name = "resource name"
            const pKey = "pagination key"
            const state1 = reducer(C.initialState, addResource(name, pKey))
            const state2 = reducer(state1, fetchSuccess(name, { [pKey]: [1, 2, 3, 4] }))
            expect(
                reducer(state2, fetchAdditionalSuccess(name, { [pKey]: [5, 6, 7, 8] }))
            ).to.deep.equal({
                [name]: {
                    data: {
                        [pKey]: [1, 2, 3, 4, 5, 6, 7, 8]
                    },
                    error: false,
                    loading: false,
                    paginationKey: pKey
                }
            })
        })
        it("should apply accept response to new data", () => {
            const name = "resource name"
            const pKey = "pagination key"
            const acceptResponse = data => ({ [pKey]: data[pKey].map(x => x * 2), plus: "extra" })
            const state1 = reducer(C.initialState, addResource(name, pKey))
            const state2 = reducer(state1, fetchSuccess(name, { [pKey]: [1, 2, 3, 4] }))
            expect(
                reducer(
                    state2,
                    fetchAdditionalSuccess(name, { [pKey]: [5, 6, 7, 8] }, acceptResponse)
                )
            ).to.deep.equal({
                [name]: {
                    data: {
                        [pKey]: [1, 2, 3, 4, 10, 12, 14, 16],
                        plus: "extra"
                    },
                    error: false,
                    loading: false,
                    paginationKey: pKey
                }
            })
        })
    })
    describe("Fetch Error", () => {
        it("should do nothing if resource does not exist", () => {
            const name = "unlucky resource"
            expect(reducer(C.initialState, fetchError(name))).to.deep.equal(C.initialState)
        })
        it("should set flags and clear data", () => {
            const name = "unfortunate resource"
            expect(
                reducer(
                    { [name]: { ...C.initialResourceState, data: { something: "is here" } } },
                    fetchError(name)
                )
            ).to.deep.equal({
                [name]: {
                    data: {},
                    loading: false,
                    error: true,
                    paginationKey: undefined
                }
            })
        })
    })
    describe("Remove Resource", () => {
        it("should do nothing if resource does not exist", () => {
            const name = "unknown resource"
            expect(reducer(C.initialState, removeResource(name))).to.deep.equal(C.initialState)
        })
        it("should remove the correct resource", () => {
            const r1 = "resource_1"
            const r2 = "resource_2"
            const state1 = reducer(C.initialState, addResource(r1))
            const state2 = reducer(state1, addResource(r2))
            expect(reducer(state2, removeResource(r2))).to.deep.equal(state1)
            expect(reducer(state1, removeResource(r1))).to.deep.equal(C.initialState)
        })
    })
})
