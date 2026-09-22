"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import {
  Button,
  DisplaySurface,
  Panel,
  PropertyRow,
  StatusIndicator,
  type StatusTone,
} from "@/design-system";
import { fetchApiHealth, getApiBaseUrl, type ApiHealth } from "@/lib/api";

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
      .then((health) => {
        setState({ kind: "reachable", health });
      })
      .catch((error: unknown) => {
        if (signal?.aborted === true) {
          return;
        }

        setState({
          kind: "unreachable",
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadHealth(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadHealth]);

  const handleRetry = useCallback(() => {
    setState({ kind: "checking" });
    void loadHealth();
  }, [loadHealth]);

  const statusLabel =
    state.kind === "checking"
      ? t("checking")
      : state.kind === "reachable"
        ? t("online")
        : t("unreachable");

  return (
    <Panel
      withScrews
      title={t("panelTitle")}
      headerAction={
        <StatusIndicator tone={statusTone[state.kind]}>{statusLabel}</StatusIndicator>
      }
    >
      <DisplaySurface tone={state.kind === "unreachable" ? "danger" : "display"}>
        {state.kind === "checking" ? t("checkingMessage") : null}
        {state.kind === "reachable" ? t("reachableMessage") : null}
        {state.kind === "unreachable" ? state.reason : null}
      </DisplaySurface>

      <dl>
        <PropertyRow label={t("endpointLabel")}>{`${getApiBaseUrl()}/health`}</PropertyRow>
        {state.kind === "reachable" ? (
          <PropertyRow label={t("serviceLabel")}>{state.health.service}</PropertyRow>
        ) : null}
      </dl>

      <Button
        variant="secondary"
        isLoading={state.kind === "checking"}
        loadingLabel={t("retryLoading")}
        onClick={handleRetry}
      >
        {t("retry")}
      </Button>
    </Panel>
  );
}
