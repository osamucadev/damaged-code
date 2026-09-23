"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Badge, Button, DisplaySurface, Dossier, Loader, PropertyRow } from "@/design-system";

import styles from "./CharacterDossier.module.css";
import { useCharacter } from "./useCharacter";

export interface CharacterDossierProps {
  characterId: number;
  /** Shown as the title while the detail is still loading. */
  fallbackName: string;
  /** Episode the grid was showing, so the current appearance can be marked. */
  currentEpisodeId?: number;
  onClose: () => void;
}

/**
 * The character detail, opened over the episode page.
 *
 * Detail is only requested once a dossier is opened, so the grid stays cheap.
 * Episode appearances arrive from the API as identity, and the route is built
 * here, because the page path belongs to this client and not to the contract.
 */
export function CharacterDossier({
  characterId,
  fallbackName,
  currentEpisodeId,
  onClose,
}: CharacterDossierProps) {
  const t = useTranslations("characters");
  const { data, isPending, isError, error, refetch, isFetching } = useCharacter(characterId);

  const isMissing =
    isError && error instanceof Error && "code" in error && error.code === "CHARACTER_NOT_FOUND";

  return (
    <Dossier
      closeLabel={t("dossierClose")}
      eyebrow={t("dossierEyebrow")}
      onClose={onClose}
      title={data?.name ?? fallbackName}
    >
      {isPending ? (
        <DisplaySurface className={styles.state}>
          {t("dossierLoading")}
          <Loader label={t("dossierLoadingLabel")} size="small" />
        </DisplaySurface>
      ) : null}

      {isError ? (
        <>
          <DisplaySurface tone="danger">
            {isMissing ? t("dossierNotFound") : t("dossierError")}
          </DisplaySurface>
          <div className={styles.retry}>
            <Button
              isLoading={isFetching}
              loadingLabel={t("dossierLoadingLabel")}
              onClick={() => {
                void refetch();
              }}
              variant="secondary"
            >
              {t("retry")}
            </Button>
          </div>
        </>
      ) : null}

      {data === undefined ? null : (
        <div className={styles.content}>
          <div className={styles.identity}>
            {/*
              A plain image element, consistent with the grid: the portrait URL
              is part of the contract and needs no media proxy.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={t("portraitAlt", { name: data.name })}
              className={styles.portrait}
              height={300}
              src={data.image}
              width={300}
            />
            <dl className={styles.facts}>
              <PropertyRow label={t("statusLabel")}>{data.status}</PropertyRow>
              <PropertyRow label={t("speciesLabel")}>{data.species}</PropertyRow>
              {data.type === "" ? null : (
                <PropertyRow label={t("typeLabel")}>{data.type}</PropertyRow>
              )}
              <PropertyRow label={t("genderLabel")}>{data.gender}</PropertyRow>
              <PropertyRow label={t("originLabel")}>{data.origin}</PropertyRow>
              <PropertyRow label={t("locationLabel")}>{data.location}</PropertyRow>
            </dl>
          </div>

          <section aria-labelledby="dossier-appearances" className={styles.appearances}>
            <div className={styles.appearancesHeader}>
              <h3 className={styles.appearancesTitle} id="dossier-appearances">
                {t("appearancesTitle")}
              </h3>
              <Badge tone="neutral">
                {t("appearancesCount", { total: data.episodes.length })}
              </Badge>
            </div>

            {data.episodes.length === 0 ? (
              <DisplaySurface tone="warning">{t("appearancesEmpty")}</DisplaySurface>
            ) : (
              <ul className={styles.appearanceList}>
                {data.episodes.map((episode) => (
                  <li key={episode.id}>
                    <Link
                      aria-current={episode.id === currentEpisodeId ? "page" : undefined}
                      className={styles.appearance}
                      href={`/episodes/${episode.id}`}
                    >
                      <Badge tone={episode.id === currentEpisodeId ? "accent" : "display"}>
                        {episode.code}
                      </Badge>
                      <span className={styles.appearanceName}>{episode.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Dossier>
  );
}
