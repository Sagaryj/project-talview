import { randomUUID } from 'crypto'
import type { CreateUserInput, User } from './user.types'

const users: User[] = []

export async function getUsers(): Promise<User[]> {
  return users
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const user: User = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase()
  }

  users.push(user)

  return user
}
