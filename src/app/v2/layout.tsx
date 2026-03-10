import "./theme.css";
import { V2Providers } from "@/providers/V2Providers";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <V2Providers>{children}</V2Providers>;
}
