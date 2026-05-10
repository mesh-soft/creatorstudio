import { CreatorStudioClient } from "./CreatorStudioClient";

type CreatorPageProps = {
  params: Promise<{
    tenantType: "doctor" | "hospital";
    tenantId: string;
  }>;
};

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { tenantType, tenantId } = await params;
  return <CreatorStudioClient tenantType={tenantType} tenantId={tenantId} />;
}
