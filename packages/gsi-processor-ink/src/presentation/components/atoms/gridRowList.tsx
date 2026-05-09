import { Fragment } from "react";
import { GridRow } from "./gridRow";

export interface KeyValueRow {
  label: string;
  value: string;
}

export interface GridRowListProps {
  rows: readonly KeyValueRow[];
}

/** Renders a vertical list of `GridRow` entries from plain data. */
export function GridRowList({ rows }: GridRowListProps) {
  return (
    <>
      {rows.map((row, index) => (
        <Fragment key={index}>
          <GridRow label={row.label} value={row.value} />
        </Fragment>
      ))}
    </>
  );
}
