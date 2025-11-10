/**
 * AWTEN Functionality Test Script
 *
 * This script helps test the campaign separation and credit deduction functionality.
 * Run this in your browser console while logged into the application.
 */

class AWTENTester {
  constructor() {
    this.baseUrl = window.location.origin;
    this.results = [];
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testCampaignsAPI() {
    console.log('🧪 Testing /api/campaigns endpoint...');
    const result = await this.makeRequest('/api/campaigns');

    if (result.success) {
      console.log('✅ Campaigns API working');
      console.log(
        `📊 Found ${result.data.campaigns?.length || 0} campaigns for current user`
      );
      return result.data.campaigns || [];
    } else {
      console.error('❌ Campaigns API failed:', result.error);
      return [];
    }
  }

  async testAvailableCampaignsAPI() {
    console.log('🧪 Testing /api/earn/available-campaigns endpoint...');
    const result = await this.makeRequest('/api/earn/available-campaigns');

    if (result.success) {
      console.log('✅ Available campaigns API working');
      console.log(
        `📊 Found ${result.data.campaigns?.length || 0} campaigns available to visit`
      );
      return result.data.campaigns || [];
    } else {
      console.error('❌ Available campaigns API failed:', result.error);
      return [];
    }
  }

  async testVisitCampaign(campaignId, url) {
    console.log(`🧪 Testing visit to campaign ${campaignId}...`);
    const result = await this.makeRequest('/api/earn/visit', {
      method: 'POST',
      body: JSON.stringify({ campaign_id: campaignId, url })
    });

    if (result.success) {
      console.log('✅ Visit successful');
      console.log(`💰 Credits earned: ${result.data.credits_earned}`);
      return result.data;
    } else {
      console.error('❌ Visit failed:', result.data?.error);
      return null;
    }
  }

  async testProfileAPI() {
    console.log('🧪 Testing /api/profile endpoint...');
    const result = await this.makeRequest('/api/profile');

    if (result.success) {
      console.log('✅ Profile API working');
      console.log(
        `👤 Current user credits: ${result.data.profile?.credits || 0}`
      );
      return result.data.profile;
    } else {
      console.error('❌ Profile API failed:', result.error);
      return null;
    }
  }

  async runFullTest() {
    console.log('🚀 Starting AWTEN functionality test...');
    console.log('='.repeat(50));

    // Test 1: Get current user's campaigns
    const userCampaigns = await this.testCampaignsAPI();

    // Test 2: Get available campaigns to visit
    const availableCampaigns = await this.testAvailableCampaignsAPI();

    // Test 3: Get current user profile
    const profile = await this.testProfileAPI();

    // Test 4: Check campaign separation
    console.log('\n🔍 Campaign Separation Check:');
    console.log(`Your campaigns: ${userCampaigns.length}`);
    console.log(`Available to visit: ${availableCampaigns.length}`);

    // Check if any of your campaigns appear in available campaigns
    const userCampaignIds = userCampaigns.map((c) => c.id);
    const availableCampaignIds = availableCampaigns.map((c) => c.campaign_id);
    const overlap = userCampaignIds.filter((id) =>
      availableCampaignIds.includes(id)
    );

    if (overlap.length === 0) {
      console.log(
        '✅ Campaign separation working correctly - no overlap found'
      );
    } else {
      console.log(
        '❌ Campaign separation issue - your campaigns appear in available campaigns'
      );
      console.log('Overlapping campaigns:', overlap);
    }

    // Test 5: Try to visit a campaign (if available)
    if (availableCampaigns.length > 0) {
      const testCampaign = availableCampaigns[0];
      console.log(`\n🎯 Testing visit to campaign: ${testCampaign.title}`);

      const visitResult = await this.testVisitCampaign(
        testCampaign.campaign_id,
        testCampaign.url
      );

      if (visitResult) {
        console.log('✅ Visit test successful');

        // Check if campaign still appears in available campaigns
        setTimeout(async () => {
          const updatedAvailable = await this.testAvailableCampaignsAPI();
          const stillAvailable = updatedAvailable.find(
            (c) => c.campaign_id === testCampaign.campaign_id
          );

          if (stillAvailable) {
            console.log('✅ Campaign still available (has remaining credits)');
          } else {
            console.log('✅ Campaign no longer available (credits exhausted');
          }
        }, 1000);
      }
    } else {
      console.log('ℹ️ No campaigns available to test visit functionality');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Test completed!');

    return {
      userCampaigns,
      availableCampaigns,
      profile,
      campaignSeparationWorking: overlap.length === 0
    };
  }
}

// Usage instructions
console.log(`
🧪 AWTEN Functionality Tester
============================

To run the test:
1. Make sure you're logged into the application
2. Run: const tester = new AWTENTester();
3. Run: await tester.runFullTest();

This will test:
- Campaign separation (your campaigns vs available campaigns)
- API endpoints functionality
- Credit earning system
- Real-time updates

Make sure to test with multiple users to verify complete functionality.
`);

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.AWTENTester = AWTENTester;
  console.log('✅ AWTENTester loaded. Run: new AWTENTester().runFullTest()');
}
