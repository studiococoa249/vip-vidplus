export type DbVideoActorRow = {
  id: string;
  id_actor: string;
  url_video: unknown;
  create_at: string;
  update_at: string;
};

export type ActorVideoFile = {
  id: string;
  name: string;
  videoUrl: string;
  modified: string;
};

function nameFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").pop();
    if (filename) {
      return decodeURIComponent(filename);
    }
  } catch {
    // ignore invalid URLs
  }

  return "Video";
}

function itemToVideoFile(
  row: DbVideoActorRow,
  item: unknown,
  index: number,
  suffix = "",
): ActorVideoFile | null {
  if (typeof item === "string" && item.trim()) {
    return {
      id: suffix ? `${row.id}-${suffix}` : row.id,
      name: nameFromUrl(item),
      videoUrl: item,
      modified: row.update_at,
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const url = record.url ?? record.video ?? record.src ?? record.link;

  if (typeof url !== "string" || !url.trim()) {
    return null;
  }

  const name =
    (typeof record.name === "string" && record.name) ||
    (typeof record.title === "string" && record.title) ||
    nameFromUrl(url);

  return {
    id: suffix ? `${row.id}-${suffix}` : row.id,
    name,
    videoUrl: url,
    modified: row.update_at,
  };
}

export function parseVideoActorRow(
  row: DbVideoActorRow,
  rowIndex: number,
): ActorVideoFile[] {
  const payload = row.url_video;

  if (!payload) {
    return [];
  }

  if (typeof payload === "string") {
    const file = itemToVideoFile(row, payload, rowIndex);
    return file ? [file] : [];
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item, index) => itemToVideoFile(row, item, rowIndex, String(index)))
      .filter((item): item is ActorVideoFile => item !== null);
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.videos)) {
      return record.videos
        .map((item, index) =>
          itemToVideoFile(row, item, rowIndex, String(index)),
        )
        .filter((item): item is ActorVideoFile => item !== null);
    }

    const file = itemToVideoFile(row, payload, rowIndex);
    return file ? [file] : [];
  }

  return [];
}
