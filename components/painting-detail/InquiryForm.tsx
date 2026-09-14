"use client"
import { useState } from "react"

export default function InquiryForm({paintingTitle}: {paintingTitle: string})
{
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [country, setCountry] = useState("");

    function handleSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        console.log({paintingTitle, name,contact,country});
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                value={name}
                onChange={(e)=> setName(e.target.value)}
                placeholder="Your name"
                className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900"
                required
            />
            <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Email or phone"
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900"
        required
      />
      <input
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="Country"
        className="w-full border-b border-neutral-300 py-2 text-sm focus:outline-none focus:border-neutral-900"
        required
      />
      <button
        type="submit"
        className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wide"
      >
        Inquire to buy
        </button>
        </form>
    )
}