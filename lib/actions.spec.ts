import { addResource } from "./actions"
import { ADD_RESOURCE } from "./constants"
import { expect } from "chai"
import "mocha"

describe("Actions", () => {
    it("Add Resource", () => {
        const NAME = "NAME"
        const { type, name } = addResource(NAME)
        expect(type).to.equal(ADD_RESOURCE)
        expect(name).to.equal(NAME)
    })
})
