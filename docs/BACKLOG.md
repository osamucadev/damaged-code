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

Allow a user to describe an episode without knowing its exact title.

Potential future direction:

```text
lexical retrieval
semantic retrieval
combined ranking
enriched episode metadata
```

Important constraint:

The public Rick and Morty API does not provide enough narrative context by itself for strong semantic episode discovery. Any enrichment source and its provenance must be documented.

Reason for backlog:

This feature introduces data enrichment, indexing, search design, and possibly model infrastructure. It is only justified after the required delivery is complete.

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
