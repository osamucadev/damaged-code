"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { EpisodeLinkCard } from "@/design-system";
import { groupEpisodesBySeason, parseEpisodeCode, type Episode } from "@/lib/episodes";

import styles from "./EpisodeNavigator.module.css";

export interface EpisodeNavigatorProps {
  currentEpisode: Episode;
  episodes: Episode[];
}

export function EpisodeNavigator({ currentEpisode, episodes }: EpisodeNavigatorProps) {
  const t = useTranslations("episodes");
  const home = useTranslations("home");
  const currentSeason = parseEpisodeCode(currentEpisode.code)?.season ?? 0;
  const grouped = useMemo(() => groupEpisodesBySeason(episodes), [episodes]);
  const seasons = [...grouped.keys()].sort((first, second) => first - second);
  const [selectedSeason, setSelectedSeason] = useState(currentSeason);
  const navigatorRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 68rem)").matches) {
      navigatorRef.current?.removeAttribute("open");
    }
  }, []);

  return (
    <details className={styles.navigator} open ref={navigatorRef}>
      <summary>
        <span>{t("navigatorTitle")}</span>
        <span className={styles.summaryAction}>{t("navigatorSummary")}</span>
      </summary>
      <div className={styles.body}>
        <div aria-label={home("seasonLabel")} className={styles.seasons} role="tablist">
          {seasons.map((season) => (
            <button
              aria-selected={selectedSeason === season}
              key={season}
              onClick={() => setSelectedSeason(season)}
              role="tab"
              type="button"
            >
              {String(season).padStart(2, "0")}
            </button>
          ))}
        </div>
        <ul className={styles.episodes} role="tabpanel">
          {(grouped.get(selectedSeason) ?? []).map((episode) => (
            <EpisodeLinkCard
              code={episode.code}
              current={episode.id === currentEpisode.id}
              currentLabel={t("current")}
              href={`/episodes/${episode.id}`}
              key={episode.id}
              label={home("openEpisode", { code: episode.code, name: episode.name })}
              meta={t("characterCount", { count: episode.characterCount })}
              name={episode.name}
            />
          ))}
        </ul>
      </div>
    </details>
  );
}
