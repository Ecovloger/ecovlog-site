import PublicEcoMap from "@/components/PublicEcoMap";
import {
  PUBLIC_COMPLAINTS_QUERY,
  type PublicComplaint,
} from "@/lib/publicComplaints";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

async function getPublicComplaints(): Promise<
  PublicComplaint[]
> {
  try {
    return await client.fetch<PublicComplaint[]>(
      PUBLIC_COMPLAINTS_QUERY,
      {},
      {
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error(
      "Public complaints loading error:",
      error,
    );

    return [];
  }
}

export default async function ExploreMapPage() {
  const complaints =
    await getPublicComplaints();

  return (
    <PublicEcoMap complaints={complaints} />
  );
}