import { Suspense } from "react";
import GlobalSettingsPage from "./GlobalSettingsClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="admin-shell" style={{ padding: 40 }}>
          Loading…
        </div>
      }
    >
      <GlobalSettingsPage />
    </Suspense>
  );
}
