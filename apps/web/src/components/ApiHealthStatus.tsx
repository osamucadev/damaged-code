"use client";

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

/*
 * Product level strings stay here for now. They move into localization
 * resources during the internationalization checkpoint, which is why no design
 * system component below receives a hardcoded string of its own.
 */
const text = {
  panelTitle: "API status",
  checking: "Checking",
  online: "Online",
  unreachable: "Unreachable",
  checkingMessage: "Contacting the project API...",
  reachableMessage: "The project API answered the health check.",
  endpointLabel: "Endpoint",
  serviceLabel: "Service",
  retry: "Check again",
  retryLoading: "Checking the API",
};

export function ApiHealthStatus() {
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
      ? text.checking
      : state.kind === "reachable"
        ? text.online
        : text.unreachable;

  return (
    <Panel
      withScrews
      title={text.panelTitle}
      headerAction={
        <StatusIndicator tone={statusTone[state.kind]}>{statusLabel}</StatusIndicator>
      }
    >
      <DisplaySurface tone={state.kind === "unreachable" ? "danger" : "display"}>
        {state.kind === "checking" ? text.checkingMessage : null}
        {state.kind === "reachable" ? text.reachableMessage : null}
        {state.kind === "unreachable" ? state.reason : null}
      </DisplaySurface>

      <dl>
        <PropertyRow label={text.endpointLabel}>{`${getApiBaseUrl()}/health`}</PropertyRow>
        {state.kind === "reachable" ? (
          <PropertyRow label={text.serviceLabel}>{state.health.service}</PropertyRow>
        ) : null}
      </dl>

      <Button
        variant="secondary"
        isLoading={state.kind === "checking"}
        loadingLabel={text.retryLoading}
        onClick={handleRetry}
      >
        {text.retry}
      </Button>
    </Panel>
  );
}
