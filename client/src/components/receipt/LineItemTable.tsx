import { formatCurrency } from "../../utils/formatCurrency.js";
import type { LineItemRecord } from "@receipt/shared";

interface LineItemTableProps {
  items: LineItemRecord[];
  currency?: string;
}

export function LineItemTable({ items, currency = "USD" }: LineItemTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-400 italic py-2">No line items extracted</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-receipt-line">
            <th className="text-left py-2 pr-4 text-ink-500 font-medium">
              Item
            </th>
            <th className="text-right py-2 px-2 text-ink-500 font-medium">
              Qty
            </th>
            <th className="text-right py-2 px-2 text-ink-500 font-medium">
              Unit
            </th>
            <th className="text-right py-2 pl-4 text-ink-500 font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-receipt-line/50 last:border-0"
            >
              <td className="py-2 pr-4 text-ink-700">{item.description}</td>
              <td className="py-2 px-2 text-right font-mono text-ink-500">
                {item.quantity ?? "—"}
              </td>
              <td className="py-2 px-2 text-right font-mono text-ink-500">
                {item.unitPrice != null
                  ? formatCurrency(item.unitPrice, currency)
                  : "—"}
              </td>
              <td className="py-2 pl-4 text-right font-mono font-medium text-ink-700">
                {item.totalPrice != null
                  ? formatCurrency(item.totalPrice, currency)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
