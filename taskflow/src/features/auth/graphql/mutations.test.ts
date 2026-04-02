import { LOGIN_MUTATION, SIGNUP_MUTATION, START_SIGNUP_MUTATION, UPDATE_CURRENT_USER_MUTATION, VERIFY_SIGNUP_MUTATION } from "./mutations"

describe("auth mutation documents", () => {
  it("exports the expected auth mutations", () => {
    expect(LOGIN_MUTATION.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "Login" } })
    expect(SIGNUP_MUTATION.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "Signup" } })
    expect(START_SIGNUP_MUTATION.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "StartSignup" } })
    expect(VERIFY_SIGNUP_MUTATION.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "VerifySignup" } })
    expect(UPDATE_CURRENT_USER_MUTATION.definitions[0]).toMatchObject({ operation: "mutation", name: { value: "UpdateCurrentUser" } })
  })
})
