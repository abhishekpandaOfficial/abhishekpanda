import { DELIVERY_RECORDS } from "@/data/openowl-mock";
import { StatusTable } from "@/components/openowl/admin/StatusTable";

export default function DeliveryPage() {
  return (
    <section>
      <h2 className="text-lg font-semibold">Delivery Status</h2>
      <p className="text-sm text-muted-foreground">Track message states and retry failed deliveries.</p>
      <div className="mt-4">
        <StatusTable rows={DELIVERY_RECORDS} />
      </div>
    </section>
  );
}
