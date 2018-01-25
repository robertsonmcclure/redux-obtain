import { config } from "../src/config"
import { getResourceData, getMetaData } from "../src/selectors"

describe("Selectors", () => {
    describe("getResourceData", () => {
        it("should do nothing if resource does not exist", () => {
            expect(getResourceData("some_key")({ [config.reduxStoreName]: {} })).toMatchSnapshot()
        })
        it("should select the correct data", () => {
            const data = [1, 2, 3, 4, 5]
            const RESOURCE_KEY = "LIST_OF_STUFF"
            const state = {
                [config.reduxStoreName]: {
                    [RESOURCE_KEY]: {
                        data,
                        loading: false,
                        error: false
                    }
                }
            }
            expect(getResourceData(RESOURCE_KEY)(state)).toMatchSnapshot()
        })
        it("should apply secondary selector", () => {
            const payload = "Hello world!"
            const data = { deeply: { nested: { data: payload } } }
            const RESOURCE_KEY = "whatever dude"
            const state = {
                [config.reduxStoreName]: {
                    [RESOURCE_KEY]: {
                        data,
                        loading: false,
                        error: false
                    }
                }
            }
            const selector = data => data.deeply.nested.data
            expect(getResourceData(RESOURCE_KEY, selector)(state)).toMatchSnapshot()
        })
    })
    describe("getMetaData", () => {
        it("should select the correct data", () => {
            const state = {
                [config.reduxStoreName]: {
                    rKey: {
                        data: {},
                        loading: true,
                        error: false
                    },
                    aKey: {
                        data: {},
                        loading: false,
                        error: true
                    }
                }
            }
            expect(getMetaData("rKey")(state)).toMatchSnapshot()
            expect(getMetaData("aKey")(state)).toMatchSnapshot()
        })
    })
})
