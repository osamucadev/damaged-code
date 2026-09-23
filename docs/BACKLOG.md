# Backlog

This file contains ideas that are intentionally excluded from the initial core delivery.

Backlog items must not delay the required coding challenge behavior or the committed baseline quality work.

## Priority rule

Do not start an optional feature until the core release candidate is functional, tested, documented, and deployable.

## Traditional episode search

Possible capability:

```text
search by episode name
search by episode code
simple text filtering
```

Reason for backlog:

The challenge does not require search.

The feature is useful, but it provides less value than finishing the core product and its delivery quality first.

## Hybrid and semantic search

Possible capability:

Let a reviewer describe an episode without knowing its exact title or code, for example "what is the episode where...".

The public Rick and Morty API returns titles, codes, and air dates, but no synopsis or narrative description. A strong semantic search cannot be built on that alone, so this direction depends on an enrichment step before any retrieval work starts.

Potential future pipeline:

```text
Rick and Morty episode metadata
+
episode synopsis enrichment with documented provenance
  |
  v
normalized episode corpus
  |
  v
lexical index + embeddings
  |
  v
hybrid retrieval
  |
  v
combined ranking
  |
  v
natural-language discovery, such as "what is the episode where..."
```

Why hybrid, not lexical or semantic alone:

1. lexical search stays useful for exact titles, codes, character names, and other explicit terms a reviewer already knows;
2. semantic search becomes useful once a reviewer only remembers a concept or a plot fragment rather than a title;
3. hybrid retrieval combines both signals instead of forcing a choice between them.

Why provenance matters:

Synopsis content does not come from the core Rick and Morty REST API today. Any enrichment source used to build the corpus must be documented, including where each synopsis came from and how it was normalized, so the product never presents enriched narrative text as if it were upstream API data.

Where it lives:

Enrichment, indexing, and search infrastructure belong behind the BFF, consistent with the existing rule that clients never talk to a data source directly. Clients would keep asking the project contract a question; the BFF would own retrieval.

Scope boundary:

This is a retrieval feature, semantic and hybrid search over existing episodes, not a generation feature. Retrieval-augmented generation, answering in prose from retrieved evidence rather than returning matching episodes, would only become relevant later if the product started generating answers instead of simply finding them.

Reason for backlog:

This feature introduces data enrichment, indexing, search design, and possibly embedding infrastructure. It is only justified after the required delivery is complete.

## Authenticated experimental area

Possible capability:

Protect optional experiments behind reviewer credentials without placing the required challenge behind authentication.

Reason for backlog:

Authentication is not required for the core challenge and adds operational surface area.

If introduced later, client applications must still communicate through the BFF rather than using Firebase as an application data gateway.

## End-to-end tests

Possible capability:

1. browser-level web testing;
2. full application Flutter integration testing.

Reason for backlog:

The initial quality target is strong unit and integration coverage.

End-to-end infrastructure can be added if time remains after release stability.

## Guided onboarding

Possible capability:

A short, skippable, replayable guided tour that explains the episode and character flow to a first-time reviewer, with completion stored locally and no backend persistence required.

Reason for backlog:

This was originally planned as the final web polish checkpoint, but it was not implemented for v0.1.0. The core episode and character experience is discoverable without a tour, so the release was not held for it.

## Additional client targets

Flutter can support multiple platforms from one project.

Potential review targets include:

```text
Android
Linux
Windows
macOS
Web
```

Only platforms that can be built or reasonably validated in the available development environment should be claimed as verified.

## Backlog promotion

When an item leaves backlog:

1. add or update a checkpoint;
2. document the architectural impact;
3. define its exit criteria;
4. keep implementation incremental;
5. do not destabilize the core release.
