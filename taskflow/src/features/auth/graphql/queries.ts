import { gql } from "@apollo/client"

export const CURRENT_USER_QUERY = gql`
  query CurrentUser($id: bigint!) {
    users(where: { id: { _eq: $id } }, limit: 1) {
      id
      name
      username
      email
      preferred_language
      theme
      profile_role
      company
      timezone
      email_notifications
    }
  }
`

export const ME_QUERY = gql`
  query Me {
    me {
      user {
        id
        name
        email
      }
    }
  }
`
