import EditCampaignClient from './edit-client';

export default async function EditCampaignPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditCampaignClient campaignId={id} />;
}
