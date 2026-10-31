// app/api/livekit-token/route.ts
// Membuat token LiveKit untuk user yang sudah login DAN sudah menjadi peserta room.

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uuelyfuculctccizitgl.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PFePxGG0yZF92wiy9f35jw_T1YzTr-m";

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json(
      { error: "Server video belum diatur (LIVEKIT_* belum diisi)." },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!accessToken) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  let body: { roomId?: string; nama?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
  const roomId = body.roomId;
  if (!roomId || typeof roomId !== "string") {
    return NextResponse.json({ error: "roomId wajib diisi." }, { status: 400 });
  }

  // Client Supabase atas nama user (RLS tetap berlaku)
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await sb.auth.getUser(accessToken);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
  }
  const user = userData.user;

  // Pastikan user memang peserta aktif room ini (sudah lolos password di joinRoom)
  const { data: peserta, error: pesertaErr } = await sb
    .from("study_room_active_participants")
    .select("user_id, nama")
    .eq("room_id", roomId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (pesertaErr || !peserta) {
    return NextResponse.json({ error: "Kamu belum bergabung di room ini." }, { status: 403 });
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: user.id,
    name: peserta.nama || body.nama || "Pengguna",
    ttl: "4h",
  });
  at.addGrant({
    room: `studybuddy-${roomId}`,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, url });
}
