import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, IndianRupee, CreditCard, Ticket, Wallet, Plus, Trash2 } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type PaymentCategory = "Ticket" | "Budget" | "Expense";
type PaymentStatus = "Paid" | "Pending" | "Refunded";

type PaymentRecord = {
  id: string;
  category: PaymentCategory;
  title: string;
  amount: number;
  date: string;
  notes: string;
  status: PaymentStatus;
};

const getStorageKey = (uid: string | null) => `traveloop-payments-${uid || "guest"}`;

const defaultCategories: PaymentCategory[] = ["Ticket", "Budget", "Expense"];
const defaultStatuses: PaymentStatus[] = ["Paid", "Pending", "Refunded"];

const getInitialRecords = (): PaymentRecord[] => [
  {
    id: `payment-${Date.now()}-1`,
    category: "Ticket",
    title: "Flight ticket to Bali",
    amount: 420,
    date: new Date().toISOString().slice(0, 10),
    notes: "Roundtrip airfare",
    status: "Paid",
  },
  {
    id: `payment-${Date.now()}-2`,
    category: "Budget",
    title: "Hotel deposit",
    amount: 210,
    date: new Date().toISOString().slice(0, 10),
    notes: "Booking prepayment",
    status: "Paid",
  },
  {
    id: `payment-${Date.now()}-3`,
    category: "Expense",
    title: "City tour tickets",
    amount: 95,
    date: new Date().toISOString().slice(0, 10),
    notes: "Local guide and entrance fees",
    status: "Pending",
  },
];

export default function ProfileBilling() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [form, setForm] = useState({
    category: "Ticket" as PaymentCategory,
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    status: "Paid" as PaymentStatus,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(getStorageKey(user.uid));
    if (saved) {
      try {
        setRecords(JSON.parse(saved) as PaymentRecord[]);
        return;
      } catch {
        localStorage.removeItem(getStorageKey(user.uid));
      }
    }
    setRecords(getInitialRecords());
  }, [user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(getStorageKey(user.uid), JSON.stringify(records));
  }, [records, user]);

  const totals = useMemo(() => {
    const summary = { Ticket: 0, Budget: 0, Expense: 0 } as Record<PaymentCategory, number>;
    records.forEach((record) => {
      summary[record.category] += record.amount;
    });
    return summary;
  }, [records]);

  const totalAmount = useMemo(() => records.reduce((sum, record) => sum + record.amount, 0), [records]);

  const handleInput = (field: keyof typeof form, value: string) => {
    setForm((cur) => ({ ...cur, [field]: value }));
  };

  const addRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || Number.isNaN(amount) || amount <= 0) {
      setError("Please enter a valid title and amount.");
      return;
    }
    const newRecord: PaymentRecord = {
      id: `payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: form.category,
      title: form.title.trim(),
      amount,
      date: form.date,
      notes: form.notes.trim(),
      status: form.status,
    };
    setRecords((cur) => [newRecord, ...cur]);
    setForm({ category: "Ticket", title: "", amount: "", date: new Date().toISOString().slice(0, 10), notes: "", status: "Paid" });
    setError(null);
  };

  const removeRecord = (id: string) => {
    setRecords((cur) => cur.filter((record) => record.id !== id));
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-background">Loading billing...</div>;
  }

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-xl pb-24 md:pb-xl">
      <div className="mb-lg flex flex-col gap-md">
        <Link to="/profile" className="inline-flex items-center gap-2 text-primary hover:text-primary-container transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-sm">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Billing & Payments</h1>
            <p className="font-body-md text-body-md text-secondary mt-xs">Track ticket purchases, budget payments, and expense history in one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant px-4 py-3">
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total spend</p>
              <p className="font-headline-sm text-headline-sm text-on-surface">₹{totalAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant px-4 py-3">
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Tickets</p>
              <p className="font-headline-sm text-headline-sm text-on-surface">₹{totals.Ticket.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant px-4 py-3">
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Budget</p>
              <p className="font-headline-sm text-headline-sm text-on-surface">₹{totals.Budget.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant px-4 py-3">
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Expenses</p>
              <p className="font-headline-sm text-headline-sm text-on-surface">₹{totals.Expense.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-lg lg:grid-cols-[1.3fr_0.9fr]">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-md">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Payment History</h2>
          </div>

          {records.length === 0 ? (
            <div className="text-center py-xl text-secondary">
              No payment history yet. Add the first transaction to start tracking your billing activity.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-3xl bg-background border border-outline-variant p-md shadow-sm flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <span className="inline-flex items-center gap-2 font-label-sm text-label-sm text-secondary mb-1">
                      {record.category === "Ticket" ? <Ticket className="w-4 h-4" /> : record.category === "Budget" ? <CreditCard className="w-4 h-4" /> : <IndianRupee className="w-4 h-4" />}
                      {record.category}
                    </span>
                    <h3 className="font-body-lg text-body-lg text-on-surface">{record.title}</h3>
                    <p className="font-body-sm text-body-sm text-secondary mt-xs">{record.notes || "No additional details."}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="font-headline-sm text-headline-sm text-on-surface">₹{record.amount.toLocaleString("en-IN")}</span>
                    <span className="font-body-sm text-body-sm text-secondary">{record.date}</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-label-sm ${record.status === "Paid" ? "bg-success/10 text-success" : record.status === "Refunded" ? "bg-secondary-container text-secondary" : "bg-warning/10 text-warning"}`}>
                      {record.status}
                    </span>
                    <button onClick={() => removeRecord(record.id)} className="inline-flex items-center gap-2 text-error font-label-sm hover:underline">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center gap-sm mb-md">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Add Payment Record</h2>
          </div>
          <form onSubmit={addRecord} className="space-y-lg">
            <div className="grid gap-sm">
              <label htmlFor="category" className="font-label-md text-label-md text-on-surface">Category</label>
              <select
                id="category"
                value={form.category}
                onChange={(event) => handleInput("category", event.target.value)}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {defaultCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-sm">
              <label htmlFor="title" className="font-label-md text-label-md text-on-surface">Title</label>
              <input
                id="title"
                value={form.title}
                onChange={(event) => handleInput("title", event.target.value)}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g. Train tickets"
              />
            </div>
            <div className="grid gap-sm">
              <label htmlFor="amount" className="font-label-md text-label-md text-on-surface">Amount</label>
              <input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => handleInput("amount", event.target.value)}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid gap-sm">
              <label htmlFor="date" className="font-label-md text-label-md text-on-surface">Date</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => handleInput("date", event.target.value)}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="grid gap-sm">
              <label htmlFor="status" className="font-label-md text-label-md text-on-surface">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(event) => handleInput("status", event.target.value)}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {defaultStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-sm">
              <label htmlFor="notes" className="font-label-md text-label-md text-on-surface">Notes</label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(event) => handleInput("notes", event.target.value)}
                rows={4}
                className="bg-background border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter payment details"
              />
            </div>
            <button type="submit" className="w-full bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm">
              Add payment record
            </button>
            {error && <p className="text-error font-body-sm">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
