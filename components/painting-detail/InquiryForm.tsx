"use client"
import { useState, useTransition } from "react"
import { submitInquiry } from "@/lib/actions/inquiries";

export default function InquiryForm({paintingId, paintingTitle, paintingSlug}: {paintingId:string; paintingTitle: string; paintingSlug:string})
{
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [country, setCountry] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        setError(null);

        startTransition(async ()=>{
            try {
                const redirectUrl = await submitInquiry({
                    paintingId,
                    paintingTitle,
                    paintingSlug,
                    buyerName: name,
                    buyerContact: contact,
                    buyerCountry: country,
                    message: message || undefined,
                })
                 window.location.href = redirectUrl;
            }catch(err){
                setError(err instanceof Error ? err.message :"Something went wrong");
            }
           
        })
        console.log({paintingTitle, name,contact,country});
    }

    return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
      <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or phone" required
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
      <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" required
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3}
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900" />
      <button type="submit" disabled={isPending}
        className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wide disabled:opacity-50">
        {isPending ? "Sending…" : "Inquire to buy"}
      </button>
    </form>);
}