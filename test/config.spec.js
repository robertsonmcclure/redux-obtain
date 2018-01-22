import expect from "expect"
import * as config from "../src/config"

describe("Configuration", () => {
    it("should have a default value", () => {
        const token = "some_random_token_value"
        expect(config.config.paginationInitialLoadLimit).toBe(100)
        expect(config.config.reduxStoreName).toBe("resources")
        expect(config.config.requestHeaderSelector).toBeA(Function)
        expect(
            config.config.requestHeaderSelector({ authentication: { token } }).Authorization
        ).toBe(`Basic ${token}`)
        expect(
            config.config.requestHeaderSelector({ authentication: { token } })["Content-Type"]
        ).toBe("application/json")
    })
    it("should set the configuration", () => {
        const new_store_name = "new_store_name"
        expect(config.config.paginationInitialLoadLimit).toBe(100)
        expect(config.config.reduxStoreName).toBe("resources")
        expect(config.config.requestHeaderSelector).toBeA(Function)
        config.setupFetcher({
            reduxStoreName: new_store_name
        })
        expect(config.config.reduxStoreName).toBe(new_store_name)
        config.setupFetcher({
            paginationInitialLoadLimit: 101
        })
        expect(config.config.reduxStoreName).toBe(new_store_name)
        expect(config.config.paginationInitialLoadLimit).toBe(101)
    })
})
