import { WorkspaceCard } from "@/components/common";
import { commercialLineMocks } from "../mock";

export function CostComposition({
  title = "Cost composition",
}: {
  title?: string;
}) {
  return (
    <WorkspaceCard title={title}>
      <div className="space-y-3">
        {commercialLineMocks.map((line) => (
          <div
            className="flex justify-between rounded-lg border border-border p-3"
            key={line.item}
          >
            <span>{line.item}</span>
            <span>
              {line.amount} · {line.state}
            </span>
          </div>
        ))}
      </div>
    </WorkspaceCard>
  );
}
