"use client";

import { useState } from "react";

import type { Episode } from "@/lib/episodes";

import { EpisodeCharacters } from "./EpisodeCharacters";
import styles from "./EpisodeExplorer.module.css";
import { EpisodeList } from "./EpisodeList";

/**
 * Episode browsing and the characters of the selected episode.
 *
 * The selection is client state for now. No routing is introduced, because
 * nothing in this checkpoint needs a shareable URL.
 */
export function EpisodeExplorer() {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  return (
    <div className={styles.explorer}>
      <EpisodeList
        selectedEpisodeId={selectedEpisode?.id ?? null}
        onSelectEpisode={setSelectedEpisode}
      />
      <EpisodeCharacters episode={selectedEpisode} />
    </div>
  );
}
