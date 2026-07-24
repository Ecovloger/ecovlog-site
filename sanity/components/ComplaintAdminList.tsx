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

const FILTERS: Array<{ value: ComplaintFilter; title: string }> = [
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
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.11)",
    label: "На модерации",
  },
  inProgress: {
    background: "rgba(245, 184, 0, 0.11)",
    border: "rgba(245, 184, 0, 0.25)",
    label: "В работе",
  },
  resolved: {
    background: "rgba(34, 197, 94, 0.11)",
    border: "rgba(34, 197, 94, 0.25)",
    label: "Решено",
  },
};

function normalizeStatus(status?: string): ComplaintStatus | null {
  if (status === "moderation") return "moderation";
  if (status === "inProgress" || status === "accepted") return "inProgress";
  if (status === "resolved") return "resolved";
  return null;
}

function formatDate(value?: string): string {
  if (!value) return "Дата не указана";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Дата не указана";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
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
          *[_type == "complaint" && status != "rejected"]
          | order(createdAt desc) {
            _id,
            complaintId,
            title,
            region,
            status,
            createdAt
          }
        `);

        if (!active) return;

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
        if (active) setError("Не удалось загрузить жалобы.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadComplaints();

    const subscription = client
      .listen('*[_type == "complaint"]', {}, { visibility: "query" })
      .subscribe({
        next: () => void loadComplaints(),
        error: (listenError) => console.error(listenError),
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
      if (!status) continue;
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
    <div style={{ minHeight: "100%", padding: "12px 14px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", lineHeight: 1.15 }}>
            Жалобы граждан
          </h1>
          <p style={{ margin: "3px 0 0", opacity: 0.58, fontSize: "11px" }}>
            Сначала новые
          </p>
        </div>

        <a
          href="/studio/intent/create/type=complaint;template=complaint"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "30px",
            padding: "0 11px",
            borderRadius: "7px",
            background: "#2276fc",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "12px",
          }}
        >
          Добавить жалобу
        </a>
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "9px",
          overflowX: "auto",
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
                minHeight: "28px",
                padding: "0 9px",
                borderRadius: "999px",
                border: selected
                  ? "1px solid rgba(255,255,255,0.26)"
                  : "1px solid rgba(255,255,255,0.11)",
                background: selected
                  ? "rgba(255,255,255,0.11)"
                  : "rgba(255,255,255,0.03)",
                color: "inherit",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: selected ? 650 : 500,
              }}
            >
              {item.title} · {counts[item.value]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: "20px 3px", opacity: 0.65 }}>
          Загружаем жалобы…
        </div>
      ) : error ? (
        <div style={{ padding: "20px 3px", color: "#ff8a8a" }}>{error}</div>
      ) : filteredComplaints.length === 0 ? (
        <div style={{ padding: "20px 3px", opacity: 0.65 }}>
          В этом разделе пока нет жалоб.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "4px" }}>
          {filteredComplaints.map((complaint) => {
            const status = normalizeStatus(complaint.status);
            if (!status) return null;

            const statusStyle = STATUS_STYLES[status];

            return (
              <a
                key={complaint._id}
                href={getEditUrl(complaint._id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: "8px",
                  alignItems: "center",
                  minHeight: "42px",
                  padding: "5px 9px",
                  borderRadius: "7px",
                  border: `1px solid ${statusStyle.border}`,
                  background: statusStyle.background,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "6px",
                      minWidth: 0,
                      lineHeight: 1.15,
                    }}
                  >
                    <strong
                      style={{
                        flex: "0 0 auto",
                        fontSize: "11px",
                        opacity: 0.72,
                      }}
                    >
                      {complaint.complaintId || "Без номера"}
                    </strong>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: "13px",
                        fontWeight: 650,
                      }}
                    >
                      {complaint.title || "Без названия"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      marginTop: "2px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontSize: "10px",
                      lineHeight: 1.1,
                      opacity: 0.6,
                    }}
                  >
                    <span>{formatDate(complaint.createdAt)}</span>
                    {complaint.region ? <span>· {complaint.region}</span> : null}
                  </div>
                </div>

                <span
                  style={{
                    padding: "3px 6px",
                    borderRadius: "999px",
                    border: `1px solid ${statusStyle.border}`,
                    fontSize: "10px",
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
