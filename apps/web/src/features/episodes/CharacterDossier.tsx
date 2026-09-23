"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Badge,
  Button,
  DisplaySurface,
  Dossier,
  PropertyRow,
  useDossierClose,
} from "@/design-system";
import type { EpisodeReference } from "@/lib/characters";

import styles from "./CharacterDossier.module.css";
import { useCharacter } from "./useCharacter";

export interface CharacterDossierProps {
  characterId: number;
  /** Shown as the title while the detail is still loading. */
  fallbackName: string;
  /** Episode the grid was showing, so the current appearance can be marked. */
  currentEpisodeId?: number;
  /** The card control that opened this dossier, for the open and close transition. */
  originElement?: HTMLElement | null;
  onClose: () => void;
}

/**
 * The structural placeholder shown while character detail is loading.
 *
 * It mirrors the loaded dossier's geometry, portrait, facts, and appearance
 * list, so arriving data does not jump the layout. The blocks are decorative:
 * a single status announces the loading state for assistive technology.
 */
function CharacterDossierSkeleton({ label }: { label: string }) {
  return (
    <div aria-live="polite" className={styles.skeleton} role="status">
      <span className={styles.srOnly}>{label}</span>
      <div aria-hidden="true" className={styles.skeletonIdentity}>
        <div className={styles.skeletonPortrait} />
        <div className={styles.skeletonFacts}>
          {[0, 1, 2, 3, 4].map((row) => (
            <div className={styles.skeletonRow} key={row}>
              <span className={styles.skeletonLabel} />
              <span className={styles.skeletonValue} />
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className={styles.skeletonAppearances}>
        <div className={styles.skeletonAppearancesHeader}>
          <span className={styles.skeletonHeading} />
          <span className={styles.skeletonBadge} />
        </div>
        <div className={styles.skeletonAppearanceList}>
          {[0, 1, 2].map((tile) => (
            <span className={styles.skeletonTile} key={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The appearance the reader is already on.
 *
 * It is a button rather than a link: activating it does not navigate, since
 * the reader is already on that episode. It closes the dossier instead, which
 * reads as returning to the episode already open.
 */
function CurrentAppearance({ episode }: { episode: EpisodeReference }) {
  const t = useTranslations("characters");
  const requestClose = useDossierClose();

  return (
    <button
      aria-current="page"
      aria-label={t("currentAppearanceLabel", { name: episode.name })}
      className={styles.appearance}
      onClick={requestClose}
      type="button"
    >
      <Badge tone="accent">{episode.code}</Badge>
      <span className={styles.appearanceName}>{episode.name}</span>
    </button>
  );
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
  originElement,
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
      originElement={originElement}
      title={data?.name ?? fallbackName}
    >
      {isPending ? <CharacterDossierSkeleton label={t("dossierLoading")} /> : null}

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
                {data.episodes.map((episode) =>
                  episode.id === currentEpisodeId ? (
                    <li key={episode.id}>
                      <CurrentAppearance episode={episode} />
                    </li>
                  ) : (
                    <li key={episode.id}>
                      <Link className={styles.appearance} href={`/episodes/${episode.id}`}>
                        <Badge tone="display">{episode.code}</Badge>
                        <span className={styles.appearanceName}>{episode.name}</span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        </div>
      )}
    </Dossier>
  );
}
