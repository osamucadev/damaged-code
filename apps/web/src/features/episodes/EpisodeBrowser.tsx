"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button, DisplaySurface, EpisodeLinkCard, Loader, Panel } from "@/design-system";
import { groupEpisodesBySeason } from "@/lib/episodes";

import styles from "./EpisodeBrowser.module.css";
import { useEpisodes } from "./useEpisodes";

export function EpisodeBrowser() {
  const t = useTranslations("home");
  const episodeText = useTranslations("episodes");
  const { data = [], isPending, isError, isFetching, refetch } = useEpisodes();
  const grouped = useMemo(() => groupEpisodesBySeason(data), [data]);
  const seasons = [...grouped.keys()].sort((first, second) => first - second);
  const [chosenSeason, setChosenSeason] = useState<number | null>(null);
  const selectedSeason = chosenSeason ?? seasons[0] ?? null;
  const episodes = selectedSeason === null ? [] : (grouped.get(selectedSeason) ?? []);

  return (
    <Panel className={styles.browser} title={t("browserTitle")} withScrews>
      <div className={styles.introRow}>
        <p>{t("browserIntro")}</p>
        {data.length > 0 ? <span className={styles.count}>{episodeText("count", { total: data.length })}</span> : null}
      </div>

      {isPending ? (
        <DisplaySurface className={styles.state}>
          {episodeText("loading")}
          <Loader label={episodeText("loadingLabel")} size="small" />
        </DisplaySurface>
      ) : null}

      {isError ? (
        <DisplaySurface className={styles.error} tone="danger">
          <span>{episodeText("error")}</span>
          <Button
            isLoading={isFetching}
            loadingLabel={episodeText("retryLoading")}
            onClick={() => void refetch()}
            variant="secondary"
          >
            {episodeText("retry")}
          </Button>
        </DisplaySurface>
      ) : null}

      {!isPending && !isError && data.length === 0 ? (
        <DisplaySurface tone="warning">{episodeText("empty")}</DisplaySurface>
      ) : null}

      {seasons.length > 0 ? (
        <>
          <div aria-label={t("seasonLabel")} className={styles.tabs} role="tablist">
            {seasons.map((season) => (
              <button
                aria-selected={season === selectedSeason}
                className={styles.tab}
                key={season}
                onClick={() => setChosenSeason(season)}
                role="tab"
                type="button"
              >
                <span className={styles.tabNumber}>{String(season).padStart(2, "0")}</span>
                <span>{t("season", { season })}</span>
              </button>
            ))}
          </div>

          <ul className={styles.grid} role="tabpanel">
            {episodes.map((episode) => (
              <EpisodeLinkCard
                code={episode.code}
                href={`/episodes/${episode.id}`}
                key={episode.id}
                label={t("openEpisode", { code: episode.code, name: episode.name })}
                meta={episodeText("characterCount", { count: episode.characterCount })}
                name={episode.name}
              />
            ))}
          </ul>
        </>
      ) : null}
    </Panel>
  );
}
