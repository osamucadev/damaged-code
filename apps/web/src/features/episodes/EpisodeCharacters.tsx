"use client";

import { useTranslations } from "next-intl";

import {
  Badge,
  Button,
  CharacterCard,
  DisplaySurface,
  Loader,
  Panel,
  PropertyRow,
  StatusIndicator,
  type StatusTone,
} from "@/design-system";
import type { Episode } from "@/lib/episodes";

import styles from "./EpisodeCharacters.module.css";
import { useEpisodeCharacters } from "./useEpisodeCharacters";

export interface EpisodeCharactersProps {
  /** The selected episode, or null while nothing is selected. */
  episode: Episode | null;
}

/**
 * Presentation rule, not a product rule: upstream publishes the status as free
 * text, so anything unrecognized is shown neutrally rather than guessed.
 */
function statusTone(status: string): StatusTone {
  const normalized = status.toLowerCase();

  if (normalized === "alive") {
    return "ok";
  }

  if (normalized === "dead") {
    return "danger";
  }

  return "neutral";
}

export function EpisodeCharacters({ episode }: EpisodeCharactersProps) {
  const t = useTranslations("characters");
  const episodeId = episode?.id ?? null;
  const { data, isPending, isError, error, refetch, isFetching } = useEpisodeCharacters(episodeId);

  const total = data?.length ?? 0;
  const isMissingEpisode =
    isError && error instanceof Error && "code" in error && error.code === "EPISODE_NOT_FOUND";

  return (
    <Panel
      withScrews
      title={t("panelTitle")}
      headerAction={
        episode === null ? null : (
          <Badge tone="accent">{t("forEpisode", { code: episode.code, name: episode.name })}</Badge>
        )
      }
    >
      {episode === null ? <DisplaySurface>{t("selectEpisode")}</DisplaySurface> : null}

      {episode !== null && isPending ? (
        <DisplaySurface className={styles.state}>
          {t("loading")}
          <Loader label={t("loadingLabel")} size="small" />
        </DisplaySurface>
      ) : null}

      {episode !== null && isError ? (
        <>
          <DisplaySurface tone="danger">
            {isMissingEpisode ? t("notFound") : t("error")}
          </DisplaySurface>
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

      {episode !== null && !isPending && !isError && total === 0 ? (
        <DisplaySurface tone="warning">{t("empty")}</DisplaySurface>
      ) : null}

      {episode !== null && !isError && total > 0 ? (
        <ul className={styles.grid}>
          {data?.map((character) => (
            <CharacterCard
              key={character.id}
              name={character.name}
              image={character.image}
              imageAlt={t("portraitAlt", { name: character.name })}
              loadingLabel={t("portraitLoading")}
              errorLabel={t("portraitError")}
              status={
                <StatusIndicator tone={statusTone(character.status)}>
                  {character.status}
                </StatusIndicator>
              }
            >
              <PropertyRow label={t("speciesLabel")}>{character.species}</PropertyRow>
              {character.type === "" ? null : (
                <PropertyRow label={t("typeLabel")}>{character.type}</PropertyRow>
              )}
              <PropertyRow label={t("genderLabel")}>{character.gender}</PropertyRow>
              <PropertyRow label={t("originLabel")}>{character.origin}</PropertyRow>
              <PropertyRow label={t("locationLabel")}>{character.location}</PropertyRow>
            </CharacterCard>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
