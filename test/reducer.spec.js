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
            expect(reducer(undefined, {})).toMatchSnapshot()
        })
    })
    describe("Add Resource", () => {
        it("should add a resource", () => {
            expect(reducer(C.initialState, actions.addResource("new_resource"))).toMatchSnapshot()
        })
        it("should add a multiple resources", () => {
            const first_resource = "first_resource_name"
            const second_resource = "second_resource_name"
            const state1 = C.initialState
            const state2 = reducer(state1, actions.addResource(first_resource))
            const final_state = reducer(state2, actions.addResource(second_resource))
            expect(final_state).toMatchSnapshot()
        })
        it("should add a pagination key", () => {
            const pName = "paginated_resource"
            const pKey = "name_of_attribute_to_be_paginated_on"
            expect(reducer(C.initialState, actions.addResource(pName, pKey))).toMatchSnapshot()
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
            ).toMatchSnapshot()
        })
        it("should do nothing if no dataTransform is given", () => {
            const name = "whatever"
            const state = reducer(C.initialState, actions.addResource(name))
            expect(reducer({ ...state }, modifyResource({ name }))).toMatchSnapshot()
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
            ).toMatchSnapshot()
        })
    })
    describe("Request Resource", () => {
        it("should do nothing if the resource does not exist", () => {
            const name = "some name"
            expect(reducer(C.initialState, requestResource(name))).toMatchSnapshot()
        })
        it("should set flags on request", () => {
            const name = "random name"
            const state = {
                [name]: C.initialResourceState
            }
            expect(reducer(state, requestResource(name))).toMatchSnapshot()
        })
    })
    describe("Fetch Success", () => {
        it("should do nothing if the resource doesn't exist", () => {
            const name = "some name"
            expect(
                reducer(C.initialState, fetchSuccess(name, { list: [1, 2, 3, 4] }, data => data))
            ).toMatchSnapshot()
        })
        it("should set the flags correctly", () => {
            const name = "resource name"
            const data = { list: [1, 2, 3, 4] }
            expect(
                reducer({ [name]: C.initialResourceState }, fetchSuccess(name, data))
            ).toMatchSnapshot()
        })
        it("should set data without dataTransform", () => {
            const name = "resource name"
            const data = {
                list: [1, 2, 3, 4],
                complicated: { nested: ["structure", "and", "a", "half"] }
            }
            expect(
                reducer({ [name]: C.initialResourceState }, fetchSuccess(name, data))
            ).toMatchSnapshot()
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
            ).toMatchSnapshot()
        })
    })
    describe("Fetch Additional Success", () => {
        it("should do nothing if the resource does not exist", () => {
            expect(
                reducer(
                    C.initialState,
                    fetchAdditionalSuccess("some name", { list: [1, 2, 3, 4] }, data => data)
                )
            ).toMatchSnapshot()
        })
        it("should set the flags correctly", () => {
            const name = "eh whatever"
            expect(
                reducer(
                    {
                        [name]: {
                            ...C.initialResourceState,
                            data: { pKey: [] },
                            paginationKey: "pKey"
                        }
                    },
                    fetchAdditionalSuccess(name, { pKey: [1, 2, 3] })
                )
            ).toMatchSnapshot()
        })
        it("should append new data onto paginationKey", () => {
            const name = "resource name"
            const pKey = "pagination key"
            const state1 = reducer(C.initialState, addResource(name, pKey))
            const state2 = reducer(state1, fetchSuccess(name, { [pKey]: [1, 2, 3, 4] }))
            expect(
                reducer(state2, fetchAdditionalSuccess(name, { [pKey]: [5, 6, 7, 8] }))
            ).toMatchSnapshot()
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
            ).toMatchSnapshot()
        })
    })
    describe("Fetch Error", () => {
        it("should do nothing if resource does not exist", () => {
            const name = "unlucky resource"
            expect(reducer(C.initialState, fetchError(name))).toMatchSnapshot()
        })
        it("should set flags and clear data", () => {
            const name = "unfortunate resource"
            expect(
                reducer(
                    { [name]: { ...C.initialResourceState, data: { something: "is here" } } },
                    fetchError(name)
                )
            ).toMatchSnapshot()
        })
    })
    describe("Remove Resource", () => {
        it("should do nothing if resource does not exist", () => {
            const name = "unknown resource"
            expect(reducer(C.initialState, removeResource(name))).toMatchSnapshot()
        })
        it("should remove the correct resource", () => {
            const r1 = "resource_1"
            const r2 = "resource_2"
            const state1 = reducer(C.initialState, addResource(r1))
            const state2 = reducer(state1, addResource(r2))
            expect(reducer(state2, removeResource(r2))).toMatchSnapshot()
            expect(reducer(state1, removeResource(r1))).toMatchSnapshot()
        })
    })
})
