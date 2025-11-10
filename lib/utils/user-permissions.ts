import { createClient } from '@/lib/utils/supabase/server';

export interface UserPermissions {
  role: 'free' | 'premium' | 'admin';
  campaignLimit: number;
  creditMultiplier: number;
  canCreateCampaign: boolean;
  canAccessAdvancedTargeting: boolean;
  canAccessAnalytics: boolean;
  canManageUsers: boolean;
}

interface ProfileData {
  role: string;
  campaign_limit: number;
  credit_multiplier: number;
}

export async function getUserPermissions(
  userId: string
): Promise<UserPermissions> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, campaign_limit, credit_multiplier')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    // Default to free user if profile not found
    return {
      role: 'free',
      campaignLimit: 3,
      creditMultiplier: 1.0,
      canCreateCampaign: true,
      canAccessAdvancedTargeting: false,
      canAccessAnalytics: true,
      canManageUsers: false
    };
  }

  const profileData = profile as ProfileData;
  const role = profileData.role as 'free' | 'premium' | 'admin';

  return {
    role,
    campaignLimit:
      profileData.campaign_limit || (role === 'premium' ? 999999 : 3),
    creditMultiplier:
      profileData.credit_multiplier || (role === 'premium' ? 1.2 : 1.0),
    canCreateCampaign: true,
    canAccessAdvancedTargeting: role === 'premium' || role === 'admin',
    canAccessAnalytics: true,
    canManageUsers: role === 'admin'
  };
}

export function checkCampaignLimit(
  currentCampaigns: number,
  userPermissions: UserPermissions
): { canCreate: boolean; reason?: string } {
  if (userPermissions.role === 'admin') {
    return { canCreate: true };
  }

  if (currentCampaigns >= userPermissions.campaignLimit) {
    if (userPermissions.role === 'free') {
      return {
        canCreate: false,
        reason: `Free users can only create ${userPermissions.campaignLimit} campaigns. Upgrade to Premium for unlimited campaigns.`
      };
    }
    return {
      canCreate: false,
      reason: 'Campaign limit reached'
    };
  }

  return { canCreate: true };
}

export function getUpgradePrompt(
  userPermissions: UserPermissions
): string | null {
  if (userPermissions.role === 'free') {
    return 'Upgrade to Premium to unlock unlimited campaigns, 1.2x credit multiplier, and advanced targeting options!';
  }
  return null;
}
