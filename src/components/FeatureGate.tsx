import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import ErrorPage from "next/error";
import { isFeatureEnabled, type FeatureName } from "@/lib/feature-flags";

/**
 * Renders children only while `feature` is on, otherwise the 404 page.
 * The flag is read after mount so QA overrides (?features=) apply without a hydration mismatch.
 */
export function FeatureGate({ feature, children }: { feature: FeatureName; children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => setEnabled(isFeatureEnabled(feature)), [feature]);
  if (enabled === null) return null;
  return enabled ? <>{children}</> : <ErrorPage statusCode={404} />;
}

/** Gates a whole page: `export default withFeature("listening", ListeningPage)`. */
export function withFeature<P extends object>(feature: FeatureName, Page: ComponentType<P>) {
  function Gated(props: P) {
    return (
      <FeatureGate feature={feature}>
        <Page {...props} />
      </FeatureGate>
    );
  }
  Gated.displayName = `withFeature(${feature})`;
  return Gated;
}
