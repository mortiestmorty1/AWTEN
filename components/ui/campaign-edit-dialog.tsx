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
import { CampaignsIcon } from '@/components/ui/icons/dashboard';
import { useConfirmationDialog } from '@/components/ui';

interface Campaign {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  country_target: string | null;
  device_target: string | null;
  credits_allocated: number;
  status: 'active' | 'paused' | 'completed' | 'deleted';
}

interface CampaignEditDialogProps {
  children: React.ReactNode;
  campaign: Campaign;
  onCampaignUpdate?: (campaignId: string, updates: Partial<Campaign>) => void;
  onCampaignDelete?: (campaignId: string) => void;
}

export const CampaignEditDialog: React.FC<CampaignEditDialogProps> = ({
  children,
  campaign,
  onCampaignUpdate,
  onCampaignDelete
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign.title,
    url: campaign.url,
    description: campaign.description || '',
    country_target: campaign.country_target || 'US',
    device_target: campaign.device_target || 'desktop',
    credits_allocated: campaign.credits_allocated,
    status: campaign.status
  });
  const { confirm, ConfirmationDialog } = useConfirmationDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        onCampaignUpdate?.(campaign.id, result.campaign);
        setOpen(false);
      } else {
        console.error('Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    confirm({
      title: 'Delete Campaign',
      description:
        'Are you sure you want to delete this campaign? This action cannot be undone.',
      confirmText: 'Yes, Delete Campaign',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/campaigns/${campaign.id}`, {
            method: 'DELETE'
          });

          if (response.ok) {
            onCampaignDelete?.(campaign.id);
            setOpen(false);
          } else {
            console.error('Failed to delete campaign');
          }
        } catch (error) {
          console.error('Error deleting campaign:', error);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CampaignsIcon className="h-5 w-5" />
            Edit Campaign
          </DialogTitle>
          <DialogDescription>
            Update your campaign settings and targeting options.
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

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'paused' | 'completed'
                  })
                }
                className="w-full px-3 py-2 border border-awten-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-awten-600"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              color="alert"
              variant="solid"
              size="small"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Campaign
            </Button>

            <div className="flex space-x-2">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
      {ConfirmationDialog}
    </Dialog>
  );
};
