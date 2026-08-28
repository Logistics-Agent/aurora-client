import { StatusBadge, WorkspaceCard } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { permissionMatrixMocks } from "../mock";

const HEADERS = ["Capability", "Operations", "Finance", "Compliance", "Admin"];

export function RolesPage() {
  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Explicit allowed, restricted and hidden capabilities."
      />
      <WorkspaceCard title="Permission matrix">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr>
                {HEADERS.map((label) => (
                  <th className="border-b p-3" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrixMocks.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td className="border-b p-3" key={`${row[0]}-${index}`}>
                      {index === 0 ? (
                        cell
                      ) : (
                        <StatusBadge
                          label={cell}
                          intent={
                            cell === "Allowed"
                              ? "success"
                              : cell === "Hidden"
                                ? "neutral"
                                : "warning"
                          }
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspaceCard>
    </>
  );
}
