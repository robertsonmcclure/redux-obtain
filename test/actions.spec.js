import * as actions from "../src/actions"
import * as C from "../src/constants"

const name = "resource_name"

describe("Actions", () => {
    it("add resource", () => {
        expect(actions.addResource(name).type).toBe(C.ADD_RESOURCE)
        expect(actions.addResource(name).name).toBe(name)
    })
    it("modifyResource", () => {
        const dataTransform = () => true
        expect(actions.modifyResource({ name, dataTransform }).type).toBe(C.MODIFY_RESOURCE)
        expect(actions.modifyResource({ name, dataTransform }).name).toBe(name)
        expect(actions.modifyResource({ name, dataTransform }).dataTransform).toBe(dataTransform)
    })
    it("requestResource", () => {
        expect(actions.requestResource(name).type).toBe(C.REQUEST_RESOURCE)
        expect(actions.requestResource(name).name).toBe(name)
    })
    it("fetchSuccess", () => {
        const data = [1, 2, 3, 4, 5]
        const acceptResponse = () => true
        expect(actions.fetchSuccess(name, data, acceptResponse).type).toBe(C.FETCH_SUCCESS)
        expect(actions.fetchSuccess(name, data, acceptResponse).name).toBe(name)
        expect(actions.fetchSuccess(name, data, acceptResponse).data).toBe(data)
        expect(actions.fetchSuccess(name, data, acceptResponse).acceptResponse).toBe(acceptResponse)
    })
    it("fetchAdditionalSuccess", () => {
        const data = [1, 2, 3, 4, 5]
        const acceptResponse = () => true
        expect(actions.fetchAdditionalSuccess(name, data, acceptResponse).type).toBe(
            C.FETCH_ADDITIONAL_SUCCESS
        )
        expect(actions.fetchAdditionalSuccess(name, data, acceptResponse).name).toBe(name)
        expect(actions.fetchAdditionalSuccess(name, data, acceptResponse).data).toBe(data)
        expect(actions.fetchAdditionalSuccess(name, data, acceptResponse).acceptResponse).toBe(
            acceptResponse
        )
    })
    it("fetchError", () => {
        expect(actions.fetchError(name).type).toBe(C.FETCH_ERROR)
        expect(actions.fetchError(name).name).toBe(name)
    })
    it("removeResource", () => {
        expect(actions.removeResource(name).type).toBe(C.REMOVE_RESOURCE)
        expect(actions.removeResource(name).name).toBe(name)
    })
})
