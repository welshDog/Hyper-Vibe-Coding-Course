/**
 * 🐾 usePetNotifications Hook
 * Drop this into any pet component to fire Base notifications
 * on level up, evolution, or reward events.
 *
 * Usage:
 *   const { notifyLevelUp, notifyEvolution, notifyReward } = usePetNotifications()
 *   await notifyLevelUp({ walletAddress, petName, detail: 'Level 5' })
 */

import { useCallback } from 'react'
import {
  sendPetNotification,
  type PetNotificationPayload,
} from '../lib/baseNotifications'

type NotifyArgs = Omit<PetNotificationPayload, 'type'>

export function usePetNotifications() {
  const notifyLevelUp = useCallback(
    (args: NotifyArgs) =>
      sendPetNotification({ ...args, type: 'level_up' }),
    []
  )

  const notifyEvolution = useCallback(
    (args: NotifyArgs) =>
      sendPetNotification({ ...args, type: 'evolution' }),
    []
  )

  const notifyReward = useCallback(
    (args: NotifyArgs) =>
      sendPetNotification({ ...args, type: 'reward' }),
    []
  )

  return { notifyLevelUp, notifyEvolution, notifyReward }
}
