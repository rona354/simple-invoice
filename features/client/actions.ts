'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser, assertOwnership } from '@/shared/lib/auth'
import { handleActionError } from '@/shared/errors'
import { clientService } from './service'
import { clientFormSchema, clientIdSchema, clientSearchSchema } from './schema'
import type { ActionResult } from '@/shared/types'
import type { Client, ClientFilter } from './types'

export async function createClient(
  formData: unknown
): Promise<ActionResult<{ client: Client }>> {
  try {
    const user = await getCurrentUser()
    const validated = clientFormSchema.parse(formData)

    const client = await clientService.create(user.id, validated)

    revalidatePath('/clients')
    return { success: true, data: { client } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getClient(
  id: string
): Promise<ActionResult<{ client: Client }>> {
  try {
    const user = await getCurrentUser()

    const validated = clientIdSchema.parse({ id })
    const client = await clientService.getById(validated.id)

    assertOwnership(client, user.id, 'client')

    return { success: true, data: { client } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getClients(
  filter?: ClientFilter
): Promise<ActionResult<{ clients: Client[]; total: number }>> {
  try {
    const user = await getCurrentUser()

    const result = await clientService.list(user.id, filter)

    return { success: true, data: result }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function searchClients(
  query: string,
  limit: number = 10
): Promise<ActionResult<{ clients: Client[] }>> {
  try {
    const user = await getCurrentUser()

    const validated = clientSearchSchema.parse({ query, limit })
    const clients = await clientService.search(user.id, validated.query, validated.limit)

    return { success: true, data: { clients } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function updateClient(
  id: string,
  formData: unknown
): Promise<ActionResult<{ client: Client }>> {
  try {
    const user = await getCurrentUser()

    const idValidated = clientIdSchema.parse({ id })
    const existing = await clientService.getById(idValidated.id)

    assertOwnership(existing, user.id, 'client', 'update')

    const dataValidated = clientFormSchema.partial().parse(formData)
    const client = await clientService.update(idValidated.id, dataValidated)

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    return { success: true, data: { client } }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function deleteClient(
  id: string
): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()

    const validated = clientIdSchema.parse({ id })
    const existing = await clientService.getById(validated.id)

    assertOwnership(existing, user.id, 'client', 'delete')

    await clientService.delete(validated.id)

    revalidatePath('/clients')
    return { success: true }
  } catch (error) {
    return handleActionError(error)
  }
}

export async function getOrCreateClient(
  formData: unknown
): Promise<ActionResult<{ client: Client }>> {
  try {
    const user = await getCurrentUser()
    const validated = clientFormSchema.parse(formData)

    const client = await clientService.getOrCreate(user.id, validated)

    return { success: true, data: { client } }
  } catch (error) {
    return handleActionError(error)
  }
}
