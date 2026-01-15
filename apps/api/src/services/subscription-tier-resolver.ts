/**
 * Subscription Tier Resolver
 * Provides subscription tier lookup for LicensingService
 *
 * This is the bridge between the subscription database and feature gating system.
 * When LicensingService needs to check a user's tier, it calls this function.
 */

import type { SubscriptionTier } from "@in-midst-my-life/schema";
import type { SubscriptionRepo } from "../repositories/subscriptions";

/**
 * Create a tier resolver function for a subscription repository
 */
export function createSubscriptionTierResolver(repo: SubscriptionRepo) {
  return async (profileId: string): Promise<SubscriptionTier> => {
    try {
      const subscription = await repo.getByProfileId(profileId);

      if (!subscription) {
        // No subscription found - default to FREE
        return "FREE";
      }

      // Check if subscription is active
      // If canceled or past_due, user keeps current tier until period ends
      if (subscription.status === "canceled" && subscription.cancelAt) {
        const now = new Date();
        if (now < subscription.cancelAt) {
          // Cancel scheduled for future date, still has access
          return subscription.tier;
        }
        // Cancellation date passed, downgrade to FREE
        return "FREE";
      }

      // For other statuses (active, incomplete, trialing, past_due), return the tier
      // Note: past_due is intentional - we don't revoke access on failed payment,
      // Stripe handles retries. Only downgrade after cancellation period ends.
      return subscription.tier;
    } catch (error) {
      console.error(`Error resolving subscription tier for ${profileId}:`, error);
      // On error, default to FREE (conservative approach)
      return "FREE";
    }
  };
}

/**
 * Type for the resolver function
 */
export type SubscriptionTierResolver = (profileId: string) => Promise<SubscriptionTier>;

/**
 * Update user's subscription tier after successful Stripe event
 */
export async function updateUserTier(
  repo: SubscriptionRepo,
  profileId: string,
  newTier: SubscriptionTier,
  status?: string
) {
  try {
    const subscription = await repo.getByProfileId(profileId);

    if (!subscription) {
      throw new Error(`No subscription found for profile ${profileId}`);
    }

    // Update tier and status
    const updates: any = { tier: newTier };
    if (status) {
      updates.status = status;
    }

    await repo.update(profileId, updates);

    return true;
  } catch (error) {
    console.error(`Error updating tier for ${profileId}:`, error);
    throw error;
  }
}

/**
 * Downgrade user to FREE tier
 */
export async function downgradeToFree(repo: SubscriptionRepo, profileId: string) {
  return updateUserTier(repo, profileId, "FREE");
}

/**
 * Get all users on a specific tier (for analytics/reporting)
 */
export async function getUsersByTier(repo: SubscriptionRepo, tier: SubscriptionTier) {
  return repo.getByTier(tier);
}
