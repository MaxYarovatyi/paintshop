export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "reserved",
  "quoted",
  "payment_sent",
  "paid",
  "in_progress",
  "shipped",
  "closed_won",
  "closed_lost",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  reserved: "Reserved",
  quoted: "Quoted",
  payment_sent: "Payment sent",
  paid: "Paid",
  in_progress: "In progress",
  shipped: "Shipped",
  closed_won: "Closed, won",
  closed_lost: "Closed, lost",
};
