import { Sign } from "crypto";
import SignUpPage from "./components/signup-page";
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div>
      <SignUpPage />
    </div>
  );
}
