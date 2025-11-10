'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from 'react';

interface UserProfile {
  id: string;
  username: string;
  role: 'free' | 'premium' | 'admin';
  credits: number;
  campaign_limit?: number;
  credit_multiplier?: number;
  total_visits: number;
}

interface Campaign {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string | null;
  country_target: string | null;
  device_target: string | null;
  credits_allocated: number;
  credits_spent: number;
  status: 'active' | 'paused' | 'completed' | 'deleted';
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  };
}

interface AppContextType {
  // User data
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateCredits: (amount: number) => void;

  // Campaigns
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;

  // Available campaigns for earning
  availableCampaigns: any[];
  setAvailableCampaigns: (campaigns: any[]) => void;
  removeAvailableCampaign: (campaignId: string) => void;

  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Refresh functions
  refreshProfile: () => Promise<void>;
  refreshCampaigns: () => Promise<void>;
  refreshAvailableCampaigns: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Update credits in real-time
  const updateCredits = (amount: number) => {
    setProfile((prev) =>
      prev ? { ...prev, credits: prev.credits + amount } : null
    );
  };

  // Campaign management functions
  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    // Update credits (deduct allocated credits)
    updateCredits(-campaign.credits_allocated);
  };

  const updateCampaign = (campaignId: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, ...updates } : c))
    );
  };

  const deleteCampaign = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    // Return credits if campaign had unspent credits
    if (campaign) {
      const unspentCredits =
        campaign.credits_allocated - campaign.credits_spent;
      if (unspentCredits > 0) {
        updateCredits(unspentCredits);
      }
    }
  };

  const removeAvailableCampaign = (campaignId: string) => {
    setAvailableCampaigns((prev) =>
      prev.filter((c) => c.campaign_id !== campaignId)
    );
  };

  // Refresh functions - memoized to prevent infinite loops
  const refreshProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, []);

  const refreshCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
    }
  }, []);

  const refreshAvailableCampaigns = useCallback(async () => {
    try {
      const response = await fetch('/api/earn/available-campaigns');
      if (response.ok) {
        const data = await response.json();
        setAvailableCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error refreshing available campaigns:', error);
    }
  }, []);

  const value: AppContextType = {
    profile,
    setProfile,
    updateCredits,
    campaigns,
    setCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    availableCampaigns,
    setAvailableCampaigns,
    removeAvailableCampaign,
    loading,
    setLoading,
    refreshProfile,
    refreshCampaigns,
    refreshAvailableCampaigns
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
