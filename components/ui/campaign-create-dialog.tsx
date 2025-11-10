'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import Button from '@/components/ui/button/button';
import Input from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import { PlusIcon } from '@/components/ui/icons/dashboard';

interface CampaignCreateDialogProps {
  children: React.ReactNode;
  onCampaignCreate?: (campaign: any) => void;
}

export const CampaignCreateDialog: React.FC<CampaignCreateDialogProps> = ({
  children,
  onCampaignCreate
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    country_target: 'US',
    device_target: 'desktop',
    credits_allocated: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newCampaign = await response.json();
        onCampaignCreate?.(newCampaign);
        setOpen(false);
        setFormData({
          title: '',
          url: '',
          description: '',
          country_target: 'US',
          device_target: 'desktop',
          credits_allocated: 100
        });
      } else {
        console.error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Create New Campaign
          </DialogTitle>
          <DialogDescription>
            Set up a new traffic campaign to drive visitors to your website.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="My Traffic Campaign"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://yourwebsite.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of your campaign"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                value={formData.country_target}
                onChange={(e) =>
                  setFormData({ ...formData, country_target: e.target.value })
                }
                className="w-full px-3 py-2 border border-awten-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-awten-600"
              >
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ALL">All Countries</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <select
                id="device"
                value={formData.device_target}
                onChange={(e) =>
                  setFormData({ ...formData, device_target: e.target.value })
                }
                className="w-full px-3 py-2 border border-awten-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-awten-600"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
                <option value="all">All Devices</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credits">Credits to Allocate</Label>
            <Input
              id="credits"
              type="number"
              min="1"
              value={formData.credits_allocated}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  credits_allocated: parseInt(e.target.value) || 0
                })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              color="gray"
              variant="outline"
              size="small"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="small"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
