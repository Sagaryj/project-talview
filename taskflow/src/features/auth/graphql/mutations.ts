import { gql } from "@apollo/client"

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const START_SIGNUP_MUTATION = gql`
  mutation StartSignup($name: String!, $email: String!, $password: String!) {
    startSignup(name: $name, email: $email, password: $password) {
      message
    }
  }
`

export const VERIFY_SIGNUP_MUTATION = gql`
  mutation VerifySignup($email: String!, $otp: String!) {
    verifySignup(email: $email, otp: $otp) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

export const UPDATE_CURRENT_USER_MUTATION = gql`
  mutation UpdateCurrentUser($id: bigint!, $changes: users_set_input!) {
    update_users(where: { id: { _eq: $id } }, _set: $changes) {
      returning {
        id
        name
        username
        email
        preferred_language
        theme
        profile_role
        company
        timezone
      }
    }
  }
`
