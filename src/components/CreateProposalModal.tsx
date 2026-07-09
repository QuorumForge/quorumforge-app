"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isValidStellarAddress } from "@/lib/utils";
import type { ProposalType } from "@/types";

const PROPOSAL_TYPES: { value: ProposalType; label: string; description: string }[] = [
  { value: "ResolveIssue", label: "Resolve Issue", description: "Approve a code/policy change" },
  { value: "TransferFunds", label: "Transfer Funds", description: "Send USDC or XLM to an address" },
  { value: "AddMember", label: "Add Member", description: "Add a new board member" },
  { value: "RemoveMember", label: "Remove Member", description: "Remove an existing board member" },
  { value: "UpdateThreshold", label: "Update Threshold", description: "Change the N-of-M requirement" },
];

const baseSchema = z.object({
  type: z.enum(["ResolveIssue", "TransferFunds", "AddMember", "RemoveMember", "UpdateThreshold"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(256, "Description cannot exceed 256 characters"),
  ttlDays: z.coerce.number().int().min(1).max(30),
});

const payloadSchemas: Record<ProposalType, z.ZodTypeAny> = {
  ResolveIssue: z.object({ issueUrl: z.string().url("Enter a valid URL") }),
  TransferFunds: z.object({
    recipient: z.string().refine(isValidStellarAddress, "Invalid G-address"),
    amount: z.coerce.number().positive(),
    asset: z.string().default("USDC"),
  }),
  AddMember: z.object({ newMember: z.string().refine(isValidStellarAddress, "Invalid G-address") }),
  RemoveMember: z.object({ member: z.string().refine(isValidStellarAddress, "Invalid G-address") }),
  UpdateThreshold: z.object({ newThreshold: z.coerce.number().int().min(1) }),
};

interface CreateProposalModalProps {
  boardContractId: string;
  memberCount: number;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function CreateProposalModal({ boardContractId, memberCount, onSubmit }: CreateProposalModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProposalType>("ResolveIssue");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(baseSchema),
    defaultValues: { type: "ResolveIssue", description: "", ttlDays: 7 },
  });

  const descriptionValue = watch("description") ?? "";

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, type: selectedType });
      reset();
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Proposal
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold">New Proposal</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 mb-5 sm:grid-cols-3">
            {PROPOSAL_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`rounded-lg border p-2.5 text-left transition-colors text-xs ${
                  selectedType === t.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-border/60 text-foreground-secondary"
                }`}
              >
                <div className="font-medium mb-0.5">{t.label}</div>
                <div className="text-[10px] opacity-70">{t.description}</div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-foreground-secondary mb-1">Description *</label>
              <textarea
                {...register("description")}
                rows={3}
                maxLength={256}
                placeholder="What does this proposal do?"
                className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p className="text-xs text-red-400" role="alert">{errors.description.message as string}</p>
                ) : <span />}
                <span className={`text-xs ${descriptionValue.length > 230 ? "text-amber-400" : "text-foreground-secondary"}`}>
                  {descriptionValue.length}/256
                </span>
              </div>
            </div>

            {/* Payload fields by type */}
            {selectedType === "TransferFunds" && (
              <>
                <input {...register("recipient" as keyof typeof baseSchema.shape)} placeholder="Recipient G-address" className="input-field" />
                <div className="flex gap-2">
                  <input {...register("amount" as keyof typeof baseSchema.shape)} type="number" placeholder="Amount" className="input-field flex-1" />
                  <input defaultValue="USDC" {...register("asset" as keyof typeof baseSchema.shape)} placeholder="Asset" className="input-field w-24" />
                </div>
              </>
            )}
            {selectedType === "ResolveIssue" && (
              <input {...register("issueUrl" as keyof typeof baseSchema.shape)} placeholder="https://github.com/..." className="input-field" />
            )}
            {(selectedType === "AddMember" || selectedType === "RemoveMember") && (
              <input
                {...register(selectedType === "AddMember" ? "newMember" as keyof typeof baseSchema.shape : "member" as keyof typeof baseSchema.shape)}
                placeholder="G-address"
                className="input-field font-mono"
              />
            )}
            {selectedType === "UpdateThreshold" && (
              <input
                {...register("newThreshold" as keyof typeof baseSchema.shape)}
                type="number"
                min={1}
                max={memberCount}
                placeholder={`New threshold (max ${memberCount})`}
                className="input-field"
              />
            )}

            <div>
              <label className="block text-xs text-foreground-secondary mb-1">Expiry (days)</label>
              <input {...register("ttlDays")} type="number" min={1} max={30} className="input-field w-28" />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Dialog.Close asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create Proposal"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
