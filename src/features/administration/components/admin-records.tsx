import { StatusBadge } from "@/components/common";
import { adminRecordMocks } from "../mock";

export function AdminRecords() {
  return (
    <div className="space-y-3">
      {adminRecordMocks.map(({ id, record, actor, state }) => (
        <div
          className="flex justify-between rounded-lg border border-border p-3"
          key={id}
        >
          <span>
            {record} · {actor}
          </span>
          <StatusBadge
            label={state}
            intent={state === "Approved" ? "success" : "warning"}
          />
        </div>
      ))}
    </div>
  );
}
