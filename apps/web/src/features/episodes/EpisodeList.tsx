"use client";

import { useTranslations } from "next-intl";

import {
  Badge,
  Button,
  DisplaySurface,
  EpisodeListItem,
  Loader,
  Panel,
} from "@/design-system";

import type { Episode } from "@/lib/episodes";

import styles from "./EpisodeList.module.css";
import { useEpisodes } from "./useEpisodes";

export interface EpisodeListProps {
  selectedEpisodeId: number | null;
  onSelectEpisode: (episode: Episode) => void;
}

export function EpisodeList({ selectedEpisodeId, onSelectEpisode }: EpisodeListProps) {
  const t = useTranslations("episodes");
  const selectLabel = useTranslations("characters");
  const { data, isPending, isError, refetch, isFetching } = useEpisodes();

  const total = data?.length ?? 0;

  return (
    <Panel
      withScrews
      title={t("panelTitle")}
      headerAction={total > 0 ? <Badge tone="neutral">{t("count", { total })}</Badge> : null}
    >
      {isPending ? (
        <DisplaySurface className={styles.state}>
          {t("loading")}
          <Loader label={t("loadingLabel")} size="small" />
        </DisplaySurface>
      ) : null}

      {isError ? (
        <>
          <DisplaySurface tone="danger">{t("error")}</DisplaySurface>
          <div className={styles.retry}>
            <Button
              variant="secondary"
              isLoading={isFetching}
              loadingLabel={t("retryLoading")}
              onClick={() => {
                void refetch();
              }}
            >
              {t("retry")}
            </Button>
          </div>
        </>
      ) : null}

      {!isPending && !isError && total === 0 ? (
        <DisplaySurface tone="warning">{t("empty")}</DisplaySurface>
      ) : null}

      {!isError && total > 0 ? (
        <ul className={styles.list}>
          {data?.map((episode) => (
            <EpisodeListItem
              key={episode.id}
              code={episode.code}
              name={episode.name}
              airDate={t("airDate", { date: episode.airDate })}
              characters={t("characterCount", { count: episode.characterCount })}
              isSelected={episode.id === selectedEpisodeId}
              onSelect={() => {
                onSelectEpisode(episode);
              }}
              selectLabel={selectLabel("selectEpisodeLabel", { name: episode.name })}
            />
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
