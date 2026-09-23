"use client";

import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

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
  const [expanded, setExpanded] = useState(false);
  const bodyId = useId();

  return (
    <section aria-labelledby={`${bodyId}-title`} className={styles.navigator}>
      <div className={styles.header}>
        <h2 id={`${bodyId}-title`}>{t("navigatorTitle")}</h2>
        <button
          aria-controls={bodyId}
          aria-expanded={expanded}
          className={styles.toggle}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? t("navigatorClose") : t("navigatorSummary")}
        </button>
      </div>
      <div className={`${styles.body} ${expanded ? "" : styles.bodyClosed}`} id={bodyId}>
        <div aria-label={home("seasonLabel")} className={styles.seasons} role="group">
          {seasons.map((season) => (
            <button
              aria-pressed={selectedSeason === season}
              key={season}
              onClick={() => setSelectedSeason(season)}
              type="button"
            >
              {String(season).padStart(2, "0")}
            </button>
          ))}
        </div>
        <ul className={styles.episodes}>
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
    </section>
  );
}
