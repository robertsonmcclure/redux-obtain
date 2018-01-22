import expect from "expect"
import { config } from "../src/config"
import { getResourceData } from "../src/selectors"

describe("Selectors", () => {
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
        expect(getResourceData(RESOURCE_KEY)(state)).toBe(data)
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
        expect(getResourceData(RESOURCE_KEY, selector)(state)).toBe(payload)
    })
})
