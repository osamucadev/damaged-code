"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Button, DisplaySurface, StatusIndicator, type StatusTone } from "@/design-system";
import { fetchApiHealth, getApiBaseUrl, type ApiHealth } from "@/lib/api";

import styles from "./ApiHealthStatus.module.css";

type HealthState =
  | { kind: "checking" }
  | { kind: "reachable"; health: ApiHealth }
  | { kind: "unreachable"; reason: string };

const statusTone: Record<HealthState["kind"], StatusTone> = {
  checking: "info",
  reachable: "ok",
  unreachable: "danger",
};

export function ApiHealthStatus() {
  const t = useTranslations("apiStatus");
  const [state, setState] = useState<HealthState>({ kind: "checking" });

  const loadHealth = useCallback((signal?: AbortSignal) => {
    return fetchApiHealth(signal)
      .then((health) => setState({ kind: "reachable", health }))
      .catch((error: unknown) => {
        if (signal?.aborted !== true) {
          setState({
            kind: "unreachable",
            reason: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadHealth(controller.signal);
    return () => controller.abort();
  }, [loadHealth]);

  const statusLabel =
    state.kind === "checking"
      ? t("checking")
      : state.kind === "reachable"
        ? t("online")
        : t("unreachable");

  return (
    <details className={styles.status}>
      <summary>
        <span className={styles.srOnly}>{t("panelTitle")}: </span>
        <StatusIndicator tone={statusTone[state.kind]}>{statusLabel}</StatusIndicator>
        <span aria-hidden="true" className={styles.disclosure}>+</span>
      </summary>
      <h2 className={styles.srOnly}>{t("panelTitle")}</h2>
      <div className={styles.details}>
        <DisplaySurface tone={state.kind === "unreachable" ? "danger" : "display"}>
          {state.kind === "checking" ? t("checkingMessage") : null}
          {state.kind === "reachable" ? t("reachableMessage") : null}
          {state.kind === "unreachable" ? state.reason : null}
        </DisplaySurface>
        <dl className={styles.meta}>
          <div>
            <dt>{t("endpointLabel")}</dt>
            <dd>{`${getApiBaseUrl()}/health`}</dd>
          </div>
          {state.kind === "reachable" ? (
            <div>
              <dt>{t("serviceLabel")}</dt>
              <dd>{state.health.service}</dd>
            </div>
          ) : null}
        </dl>
        <Button
          isLoading={state.kind === "checking"}
          loadingLabel={t("retryLoading")}
          onClick={() => {
            setState({ kind: "checking" });
            void loadHealth();
          }}
          variant="secondary"
        >
          {t("retry")}
        </Button>
      </div>
    </details>
  );
}
