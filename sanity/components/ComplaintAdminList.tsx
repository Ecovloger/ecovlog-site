"use client";

import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";

import { apiVersion } from "@/sanity/env";

type ComplaintStatus = "moderation" | "inProgress" | "resolved";
type ComplaintFilter = "all" | ComplaintStatus;

type ComplaintListItem = {
  _id: string;
  complaintId?: string;
  title?: string;
  region?: string;
  status?: string;
  createdAt?: string;
};

const FILTERS: Array<{
  value: ComplaintFilter;
  title: string;
}> = [
  { value: "all", title: "Все" },
  { value: "moderation", title: "Новые" },
  { value: "inProgress", title: "В работе" },
  { value: "resolved", title: "Решённые" },
];

const STATUS_STYLES: Record<
  ComplaintStatus,
  { background: string; border: string; label: string }
> = {
  moderation: {
    background: "rgba(255, 255, 255, 0.055)",
    border: "rgba(255, 255, 255, 0.12)",
    label: "На модерации",
  },
  inProgress: {
    background: "rgba(245, 184, 0, 0.12)",
    border: "rgba(245, 184, 0, 0.28)",
    label: "В работе",
  },
  resolved: {
    background: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.28)",
    label: "Решено",
  },
};

function normalizeStatus(status: string | undefined): ComplaintStatus | null {
  if (status === "moderation") {
    return "moderation";
  }

  if (status === "inProgress" || status === "accepted") {
    return "inProgress";
  }

  if (status === "resolved") {
    return "resolved";
  }

  return null;
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "Дата не указана";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEditUrl(documentId: string): string {
  const id = documentId.replace(/^drafts\./, "");

  return `/studio/intent/edit/id=${encodeURIComponent(id)};type=complaint`;
}

export default function ComplaintAdminList() {
  const client = useClient({ apiVersion }).withConfig({
    perspective: "previewDrafts",
  });

  const [complaints, setComplaints] = useState<ComplaintListItem[]>([]);
  const [filter, setFilter] = useState<ComplaintFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadComplaints = async () => {
      try {
        const result = await client.fetch<ComplaintListItem[]>(`
          *[
            _type == "complaint" &&
            status != "rejected"
          ]
          | order(createdAt desc) {
            _id,
            complaintId,
            title,
            region,
            status,
            createdAt
          }
        `);

        if (!active) {
          return;
        }

        const uniqueComplaints = new Map<string, ComplaintListItem>();

        for (const complaint of result) {
          const normalizedId = complaint._id.replace(/^drafts\./, "");
          const previous = uniqueComplaints.get(normalizedId);

          if (!previous || complaint._id.startsWith("drafts.")) {
            uniqueComplaints.set(normalizedId, complaint);
          }
        }

        setComplaints(Array.from(uniqueComplaints.values()));
        setError(null);
      } catch (loadError) {
        console.error(loadError);

        if (active) {
          setError("Не удалось загрузить жалобы.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadComplaints();

    const subscription = client
      .listen('*[_type == "complaint"]', {}, { visibility: "query" })
      .subscribe({
        next: () => {
          void loadComplaints();
        },
        error: (listenError) => {
          console.error(listenError);
        },
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const counts = useMemo(() => {
    const result: Record<ComplaintFilter, number> = {
      all: 0,
      moderation: 0,
      inProgress: 0,
      resolved: 0,
    };

    for (const complaint of complaints) {
      const status = normalizeStatus(complaint.status);

      if (!status) {
        continue;
      }

      result.all += 1;
      result[status] += 1;
    }

    return result;
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (filter === "all") {
      return complaints.filter((complaint) => normalizeStatus(complaint.status));
    }

    return complaints.filter(
      (complaint) => normalizeStatus(complaint.status) === filter,
    );
  }, [complaints, filter]);

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "20px",
        background: "var(--card-bg-color, transparent)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              lineHeight: 1.2,
            }}
          >
            Жалобы граждан
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              opacity: 0.65,
              fontSize: "13px",
            }}
          >
            Новые обращения всегда отображаются сверху
          </p>
        </div>

        <a
          href="/studio/intent/create/type=complaint;template=complaint"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "36px",
            padding: "0 14px",
            borderRadius: "8px",
            background: "#2276fc",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          Добавить жалобу
        </a>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        {FILTERS.map((item) => {
          const selected = filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              style={{
                flex: "0 0 auto",
                minHeight: "34px",
                padding: "0 12px",
                borderRadius: "999px",
                border: selected
                  ? "1px solid rgba(255,255,255,0.28)"
                  : "1px solid rgba(255,255,255,0.12)",
                background: selected
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(255,255,255,0.035)",
                color: "inherit",
                cursor: "pointer",
                fontWeight: selected ? 650 : 500,
              }}
            >
              {item.title} · {counts[item.value]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: "30px 4px", opacity: 0.65 }}>
          Загружаем жалобы…
        </div>
      ) : error ? (
        <div style={{ padding: "30px 4px", color: "#ff8a8a" }}>{error}</div>
      ) : filteredComplaints.length === 0 ? (
        <div style={{ padding: "30px 4px", opacity: 0.65 }}>
          В этом разделе пока нет жалоб.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {filteredComplaints.map((complaint) => {
            const status = normalizeStatus(complaint.status);

            if (!status) {
              return null;
            }

            const statusStyle = STATUS_STYLES[status];

            return (
              <a
                key={complaint._id}
                href={getEditUrl(complaint._id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: "14px",
                  alignItems: "center",
                  padding: "13px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${statusStyle.border}`,
                  background: statusStyle.background,
                  color: "inherit",
                  textDecoration: "none",
                  transition:
                    "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        flex: "0 0 auto",
                        fontSize: "13px",
                        opacity: 0.78,
                      }}
                    >
                      {complaint.complaintId || "Без номера"}
                    </strong>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 650,
                      }}
                    >
                      {complaint.title || "Без названия"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "5px",
                      fontSize: "12px",
                      opacity: 0.66,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{formatDate(complaint.createdAt)}</span>
                    {complaint.region ? <span>· {complaint.region}</span> : null}
                  </div>
                </div>

                <span
                  style={{
                    padding: "5px 8px",
                    borderRadius: "999px",
                    border: `1px solid ${statusStyle.border}`,
                    fontSize: "12px",
                    fontWeight: 650,
                    whiteSpace: "nowrap",
                  }}
                >
                  {statusStyle.label}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
