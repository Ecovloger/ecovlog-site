import type {
  ComplaintCategory,
  ComplaintStatus,
} from "@/lib/complaints";

export type PublicComplaintStatus =
  | "inProgress"
  | "resolved";

export type PublicComplaintLocation = {
  lat: number;
  lng: number;
};

export type PublicComplaintPhoto = {
  key: string;
  url: string;
  alt?: string;
};

export type PublicComplaint = {
  complaintId: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  region: string;
  address: string;
  location: PublicComplaintLocation;
  status: PublicComplaintStatus;
  createdAt: string;
  publishedAt?: string;
  videoUrl?: string;
  photos: PublicComplaintPhoto[];
};

export const PUBLIC_COMPLAINT_STATUSES: PublicComplaintStatus[] = [
  "inProgress",
  "resolved",
];

export const PUBLIC_COMPLAINTS_QUERY = `
  *[
    _type == "complaint" &&
    status in ["accepted", "inProgress", "resolved"] &&
    defined(complaintId) &&
    defined(location.lat) &&
    defined(location.lng)
  ]
  | order(coalesce(publishedAt, createdAt) desc) {
    complaintId,
    title,
    description,
    category,
    region,
    address,
    location {
      lat,
      lng
    },
    "status": select(
      status == "accepted" => "inProgress",
      status
    ),
    createdAt,
    publishedAt,
    videoUrl,
    "photos": photos[] {
      "key": coalesce(_key, asset->_id),
      "url": asset->url,
      alt
    }
  }
`;

export const PUBLIC_COMPLAINT_QUERY = `
  *[
    _type == "complaint" &&
    status in ["accepted", "inProgress", "resolved"] &&
    complaintId == $complaintId
  ][0] {
    complaintId,
    title,
    description,
    category,
    region,
    address,
    location {
      lat,
      lng
    },
    "status": select(
      status == "accepted" => "inProgress",
      status
    ),
    createdAt,
    publishedAt,
    videoUrl,
    "photos": photos[] {
      "key": coalesce(_key, asset->_id),
      "url": asset->url,
      alt
    }
  }
`;

export function isPublicComplaintStatus(
  value: ComplaintStatus | string,
): value is PublicComplaintStatus {
  return PUBLIC_COMPLAINT_STATUSES.some(
    (status) => status === value,
  );
}

export function getPublicComplaintStatusTitle(
  status: PublicComplaintStatus,
): string {
  return status === "resolved"
    ? "Решено"
    : "В работе";
}

export function getPublicComplaintStatusColor(
  status: PublicComplaintStatus,
): string {
  return status === "resolved"
    ? "#22c55e"
    : "#facc15";
}
