import { ReactNode } from "react";

export function PermissionGuard({
  permission,
  children
}: {
  permission: string;
  children: ReactNode;
}) {
  return (
    <div data-permission={permission}>
      {children}
    </div>
  );
}

