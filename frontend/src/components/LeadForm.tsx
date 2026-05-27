"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";

interface Props {
  address: string;
  lat: number;
  lng: number;
  system_kwp: number;
  annual_kwh: number;
  estimated_cost_eur: number;
}

export function LeadForm(props: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    try {
      await api.lead({
        name,
        email,
        phone,
        notes,
        address: props.address,
        lat: props.lat,
        lng: props.lng,
        system_kwp: props.system_kwp,
        annual_kwh: props.annual_kwh,
        estimated_cost_eur: props.estimated_cost_eur,
      });
      setState("ok");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  if (state === "ok") {
    return (
      <div className="border-2 border-moss bg-moss/5 p-8">
        <h3 className="font-display text-3xl mb-2">Thank you.</h3>
        <p className="text-ash">A certified installer in your area will reach out within two working days with a fixed-price quote.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h3 className="font-display text-3xl">Get a fixed-price quote.</h3>
      <p className="text-ash text-sm">
        Free, no obligation. We'll forward your details to a vetted Nordic installer.
      </p>
      <Input label="Your name" value={name} onChange={setName} required />
      <Input label="Email" value={email} onChange={setEmail} type="email" required />
      <Input label="Phone" value={phone} onChange={setPhone} type="tel" required />
      <Input label="Notes (optional)" value={notes} onChange={setNotes} />

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full bg-ink text-paper py-4 font-display text-xl tracking-wide hover:bg-sun transition-colors disabled:opacity-50"
      >
        {state === "submitting" ? "Sending…" : "Request a quote →"}
      </button>
      {state === "error" && <p className="text-sun text-sm">{errorMsg}</p>}
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ash mb-1">{label}{required && " *"}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-ink py-2 focus:outline-none focus:border-sun"
      />
    </label>
  );
}
