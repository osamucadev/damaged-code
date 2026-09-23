import type { Metadata } from "next";

import { EpisodeDetail } from "@/features/episodes/EpisodeDetail";
import { getServerApiBaseUrl } from "@/lib/api";
import { fetchEpisode } from "@/lib/episodes";

interface EpisodePageProps {
  params: Promise<{ episodeId: string }>;
}

export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { episodeId } = await params;
  const id = Number(episodeId);

  if (!Number.isInteger(id) || id < 1) {
    return { title: "Episode not found" };
  }

  try {
    const episode = await fetchEpisode(id, undefined, getServerApiBaseUrl());
    const description = `${episode.code}. Aired ${episode.airDate}. ${episode.characterCount} characters.`;

    return {
      title: `${episode.code} ${episode.name}`,
      description,
      openGraph: { title: `${episode.code} ${episode.name}`, description, images: [] },
      twitter: { card: "summary", title: `${episode.code} ${episode.name}`, description, images: [] },
    };
  } catch {
    return { title: "Episode" };
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { episodeId } = await params;
  const parsedId = Number(episodeId);
  const id = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 0;

  return <EpisodeDetail episodeId={id} />;
}
