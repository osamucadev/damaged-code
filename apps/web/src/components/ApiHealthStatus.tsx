"use client";

import { useEffect, useState } from "react";

import { fetchApiHealth, getApiBaseUrl, type ApiHealth } from "@/lib/api";

type HealthState =
  | { kind: "checking" }
  | { kind: "reachable"; health: ApiHealth }
  | { kind: "unreachable"; reason: string };

export function ApiHealthStatus() {
  const [state, setState] = useState<HealthState>({ kind: "checking" });

  useEffect(() => {
    const controller = new AbortController();

    fetchApiHealth(controller.signal)
      .then((health) => {
        setState({ kind: "reachable", health });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          kind: "unreachable",
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section aria-labelledby="api-health-heading">
      <h2 id="api-health-heading">API status</h2>
      <p role="status" aria-live="polite">
        {state.kind === "checking" && "Checking the API..."}
        {state.kind === "reachable" && `API reachable: ${state.health.service}`}
        {state.kind === "unreachable" && `API unreachable: ${state.reason}`}
      </p>
      <p>
        Endpoint: <code>{getApiBaseUrl()}/health</code>
      </p>
    </section>
  );
}
