import { CURRENT_USER_QUERY, ME_QUERY } from "./queries"

describe("auth query documents", () => {
  it("exports the expected auth queries", () => {
    expect(CURRENT_USER_QUERY.definitions[0]).toMatchObject({ operation: "query", name: { value: "CurrentUser" } })
    expect(ME_QUERY.definitions[0]).toMatchObject({ operation: "query", name: { value: "Me" } })
  })
})
