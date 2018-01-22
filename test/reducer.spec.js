import { expect } from "chai"
import { reducer } from "../src/reducer"
import * as C from "../src/constants"
import * as actions from "../src/actions"

describe("Reducer", () => {
    describe("init", () => {
        it("should return initial state", () => {
            expect(reducer(undefined, {})).to.deep.equal(C.initialState)
        })
    })
    describe("Add Resources", () => {
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
})
