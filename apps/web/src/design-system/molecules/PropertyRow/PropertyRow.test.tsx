import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PropertyRow } from "./PropertyRow";

describe("PropertyRow", () => {
  it("associates the value with its label as a description pair", () => {
    render(
      <dl>
        <PropertyRow label="Species">Human</PropertyRow>
      </dl>,
    );

    const term = screen.getByText("Species");
    const value = screen.getByText("Human");

    expect(term.tagName).toBe("DT");
    expect(value.tagName).toBe("DD");
  });

  it("accepts values of different lengths without losing either part", () => {
    render(
      <dl>
        <PropertyRow label="Ultima localizacao conhecida">
          Cidadela dos Ricks, dimensao de substituicao C-137
        </PropertyRow>
      </dl>,
    );

    expect(screen.getByText("Ultima localizacao conhecida")).toBeInTheDocument();
    expect(
      screen.getByText("Cidadela dos Ricks, dimensao de substituicao C-137"),
    ).toBeInTheDocument();
  });
});
