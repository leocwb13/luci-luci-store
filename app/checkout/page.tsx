import { Header } from "@/components/header";
import { CheckoutClient } from "@/components/checkout-client";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();

  return (
    <div className="page-shell">
      <Header settings={settings} />
      <section className="content-section">
        <CheckoutClient settings={settings} />
      </section>
    </div>
  );
}
