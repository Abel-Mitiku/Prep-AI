export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AuthCallbackPage from "./components/auth";

export default function Page() {
  return (
    <Suspense>
      <AuthCallbackPage />
    </Suspense>
  );
}
