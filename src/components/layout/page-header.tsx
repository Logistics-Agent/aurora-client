import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {breadcrumb.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumb.map((item, index) => (
                <span key={item} className="contents">
                  {index > 0 && <BreadcrumbSeparator />}
                  {index === breadcrumb.length - 1 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{item}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem>{item}</BreadcrumbItem>
                  )}
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
