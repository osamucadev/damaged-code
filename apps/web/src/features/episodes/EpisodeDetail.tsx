"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { ApiHealthStatus } from "@/components/ApiHealthStatus";
import { DecorativeFace } from "@/components/DecorativeFace";
import { Badge, Button, DisplaySurface, Loader } from "@/design-system";
import { ApiError, parseEpisodeCode } from "@/lib/episodes";

import { EpisodeCharacters } from "./EpisodeCharacters";
import styles from "./EpisodeDetail.module.css";
import { EpisodeNavigator } from "./EpisodeNavigator";
import { useEpisode } from "./useEpisode";
import { useEpisodes } from "./useEpisodes";

export interface EpisodeDetailProps {
  episodeId: number;
}

export function EpisodeDetail({ episodeId }: EpisodeDetailProps) {
  const t = useTranslations("episodes");
  const home = useTranslations("home");
  const episodeQuery = useEpisode(episodeId);
  const episodesQuery = useEpisodes();
  const episode = episodeQuery.data;

  if (episodeQuery.isPending) {
    return (
      <main className={styles.statePage}>
        <DisplaySurface className={styles.state}>
          {t("detailLoading")}
          <Loader label={t("detailLoadingLabel")} />
        </DisplaySurface>
      </main>
    );
  }

  if (episodeQuery.isError || episode === undefined) {
    const missing = episodeQuery.error instanceof ApiError && episodeQuery.error.code === "EPISODE_NOT_FOUND";

    return (
      <main className={styles.statePage}>
        <DisplaySurface className={styles.state} tone="danger">
          <strong>{missing ? t("detailNotFound") : t("detailError")}</strong>
          <div className={styles.stateActions}>
            <Link href="/">{t("backToArchive")}</Link>
            {!missing ? (
              <Button onClick={() => void episodeQuery.refetch()} variant="secondary">
                {t("retry")}
              </Button>
            ) : null}
          </div>
        </DisplaySurface>
      </main>
    );
  }

  const position = parseEpisodeCode(episode.code);
  const episodes = episodesQuery.data ?? [];
  const index = episodes.findIndex((item) => item.id === episode.id);
  const previous = index > 0 ? episodes[index - 1] : undefined;
  const next = index >= 0 ? episodes[index + 1] : undefined;

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link className={styles.wordmark} href="/">
          <span className={styles.wordmarkIcon}>DC</span>
          <span>{home("title")}</span>
        </Link>
        <ApiHealthStatus />
      </header>

      <div className={styles.shell}>
        <div className={styles.content}>
          <section className={styles.identity}>
            <DecorativeFace className={styles.face} face={42} size="medium" />
            <p className={styles.eyebrow}>{t("episodeIdentity")}</p>
            <Badge tone="accent">{episode.code}</Badge>
            <h1>{episode.name}</h1>
            <dl className={styles.metadata}>
              <div><dt>{t("seasonNumber", { season: position?.season ?? 0 })}</dt><dd>{String(position?.season ?? 0).padStart(2, "0")}</dd></div>
              <div><dt>{t("episodeNumber", { episode: position?.episode ?? 0 })}</dt><dd>{String(position?.episode ?? 0).padStart(2, "0")}</dd></div>
              <div><dt>{t("airedLabel")}</dt><dd>{episode.airDate}</dd></div>
              <div><dt>{t("charactersLabel")}</dt><dd>{episode.characterCount}</dd></div>
            </dl>
          </section>

          <nav aria-label={t("navigatorTitle")} className={styles.sequence}>
            {previous ? (
              <Link
                aria-label={t("previousEpisode", { code: previous.code, name: previous.name })}
                href={`/episodes/${previous.id}`}
              >
                <span>{t("previous")}</span><strong>{previous.code}</strong><small>{previous.name}</small>
              </Link>
            ) : <span />}
            {next ? (
              <Link
                aria-label={t("nextEpisode", { code: next.code, name: next.name })}
                href={`/episodes/${next.id}`}
              >
                <span>{t("next")}</span><strong>{next.code}</strong><small>{next.name}</small>
              </Link>
            ) : <span />}
          </nav>

          <EpisodeCharacters episode={episode} />
        </div>

        <aside className={styles.sidebar}>
          {episodesQuery.isError ? (
            <DisplaySurface tone="danger">{t("allEpisodesError")}</DisplaySurface>
          ) : episodes.length > 0 ? (
            <EpisodeNavigator currentEpisode={episode} episodes={episodes} key={episode.id} />
          ) : null}
        </aside>
      </div>
    </main>
  );
}
