"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Discussion = {
  id: number;
  title: string;
  description: string | null;
  tag: string;
  category: string | null;
  host_name: string | null;
  starts_at: string;
  ends_at: string;
};

const formatWaktu = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UpcomingDiscussion({ userId }: { userId: number | null }) {
  const [items, setItems] = useState<Discussion[]>([]);
  const [joined, setJoined] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // update "sekarang" tiap 1 menit, biar diskusi yang selesai hilang tanpa refresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("discussions")
        .select("id, title, description, tag, category, host_name, starts_at, ends_at")
        .gt("ends_at", new Date().toISOString()) // hanya yang belum selesai
        .order("starts_at", { ascending: true })
        .limit(5);

      if (error) console.error("Gagal ambil discussions:", error.message);
      const list = (data ?? []) as Discussion[];
      setItems(list);

      if (userId && list.length) {
        const { data: mine } = await supabase
          .from("discussion_participants")
          .select("discussion_id")
          .eq("user_id", userId)
          .in("discussion_id", list.map((d) => d.id));
        setJoined(new Set((mine ?? []).map((m) => m.discussion_id)));
      } else {
        setJoined(new Set());
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleJoin = async (id: number) => {
    if (!userId) return alert("Login dulu ya");
    setBusyId(id);

    if (joined.has(id)) {
      const { error } = await supabase
        .from("discussion_participants")
        .delete()
        .eq("discussion_id", id)
        .eq("user_id", userId);
      if (!error) {
        setJoined((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("discussion_participants")
        .insert({ discussion_id: id, user_id: userId });
      // 23505 = sudah pernah join (duplikat), anggap berhasil
      if (!error || error.code === "23505") {
        setJoined((prev) => new Set(prev).add(id));
      } else {
        console.error("Gagal join:", error.message);
      }
    }
    setBusyId(null);
  };

  // filter lagi di client supaya yang sudah lewat langsung hilang
  const visible = items.filter((d) => new Date(d.ends_at).getTime() > now);

  if (loading) return <p className="text-sm text-gray-400">Memuat...</p>;

  if (visible.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
        Belum ada diskusi mendatang
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((d) => {
        const berlangsung = new Date(d.starts_at).getTime() <= now;
        const sudahJoin = joined.has(d.id);

        return (
          <div key={d.id} className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <h3 className="font-semibold">{d.title}</h3>
              <p className="text-xs text-gray-500">
                {d.host_name ? `${d.host_name} · ` : ""}
                {berlangsung ? "🔴 Sedang berlangsung" : formatWaktu(d.starts_at)}
              </p>
            </div>
            <button
              onClick={() => handleJoin(d.id)}
              disabled={busyId === d.id}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium ${
                sudahJoin ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white"
              }`}
            >
              {sudahJoin ? "Joined" : "Join"}
            </button>
          </div>
        );
      })}
    </div>
  );
}