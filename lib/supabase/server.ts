import { createClient } from "@supabase/supabase-js";
import {
  parseVideoActorRow,
  type ActorVideoFile,
  type DbVideoActorRow,
} from "@/lib/supabase/video-actor";

export type { ActorVideoFile };

export type DbUser = {
  id: string;
  full_name: string;
  email: string;
  user_token: string | null;
  level: "Admin" | "Member";
  status: "Active" | "Not-Active";
  membership: "Free" | "VIP";
};

export type DbActor = {
  id: string;
  name: string;
  slug: string;
  actor_banner_imagekit_url: string | null;
  create_at: string;
  update_at: string;
  video_count: number;
};

export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, key);
}

export async function findUserByToken(userToken: string) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, user_token, level, status, membership")
    .eq("user_token", userToken)
    .eq("status", "Active")
    .maybeSingle();

  if (error) {
    console.error("Failed to look up user by token:", error.message);
    return null;
  }

  return data as DbUser | null;
}

export async function findUserById(userId: string) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, user_token, level, status, membership")
    .eq("id", userId)
    .eq("status", "Active")
    .maybeSingle();

  if (error) {
    console.error("Failed to look up user by id:", error.message);
    return null;
  }

  return data as DbUser | null;
}

export async function listActors(): Promise<DbActor[]> {
  const supabase = createServerSupabase();

  const { data: actors, error: actorsError } = await supabase
    .from("actor")
    .select("id, name, slug, actor_banner_imagekit_url, create_at, update_at")
    .order("name");

  if (actorsError) {
    console.error("Failed to list actors:", actorsError.message);
    return [];
  }

  if (!actors?.length) {
    return [];
  }

  const { data: videos, error: videosError } = await supabase
    .from("video_actor")
    .select("id_actor");

  if (videosError) {
    console.error("Failed to count actor videos:", videosError.message);
  }

  const videoCountByActor = new Map<string, number>();
  for (const video of videos ?? []) {
    if (!video.id_actor) continue;
    videoCountByActor.set(
      video.id_actor,
      (videoCountByActor.get(video.id_actor) ?? 0) + 1,
    );
  }

  return actors.map((actor) => ({
    ...actor,
    video_count: videoCountByActor.get(actor.id) ?? 0,
  })) as DbActor[];
}

export async function listVideosByActorSlug(slug: string): Promise<{
  actor: Pick<DbActor, "id" | "name" | "slug"> | null;
  videos: ActorVideoFile[];
}> {
  const supabase = createServerSupabase();

  const { data: actor, error: actorError } = await supabase
    .from("actor")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (actorError) {
    console.error("Failed to find actor by slug:", actorError.message);
    return { actor: null, videos: [] };
  }

  if (!actor) {
    return { actor: null, videos: [] };
  }

  const { data: rows, error: videosError } = await supabase
    .from("video_actor")
    .select("id, id_actor, url_video, create_at, update_at")
    .eq("id_actor", actor.id)
    .order("create_at", { ascending: false });

  if (videosError) {
    console.error("Failed to list actor videos:", videosError.message);
    return { actor, videos: [] };
  }

  const videos = (rows as DbVideoActorRow[] | null)?.flatMap((row, index) =>
    parseVideoActorRow(row, index),
  ) ?? [];

  return { actor, videos };
}
