import { config, setupFetcher } from "../src/config"

describe("Configuration", () => {
    it("should have a default value", () => {
        const state = { authentication: { token: "token" } }
        expect(config).toMatchSnapshot()
        expect(config.requestHeaderSelector(state)).toMatchSnapshot()
    })
    it("should set the configuration", () => {
        const new_store_name = "new_store_name"
        expect(config).toMatchSnapshot()
        setupFetcher({
            reduxStoreName: new_store_name
        })
        expect(config).toMatchSnapshot()
    })
})
