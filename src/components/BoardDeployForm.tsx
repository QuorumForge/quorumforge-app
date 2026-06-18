"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isValidStellarAddress } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().min(3, "Board name must be at least 3 characters"),
    threshold: z.coerce.number().int().min(1),
    initialFunding: z.coerce.number().min(0).optional(),
  })
  .refine((_) => true); // member validation done separately

interface BoardDeployFormProps {
  onDeploy: (data: {
    name: string;
    members: string[];
    threshold: number;
    initialFunding?: number;
  }) => Promise<void>;
  isDeploying?: boolean;
}

export function BoardDeployForm({ onDeploy, isDeploying }: BoardDeployFormProps) {
  const [members, setMembers] = useState<string[]>([""]);
  const [memberErrors, setMemberErrors] = useState<Record<number, string>>({});

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", threshold: 2, initialFunding: 0 },
  });

  const threshold = watch("threshold");
  const validMembers = members.filter((m) => isValidStellarAddress(m));

  const addMember = () => setMembers((prev) => [...prev, ""]);
  const removeMember = (i: number) => setMembers((prev) => prev.filter((_, idx) => idx !== i));
  const updateMember = (i: number, value: string) => {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? value : m)));
    if (!isValidStellarAddress(value) && value.length > 0) {
      setMemberErrors((prev) => ({ ...prev, [i]: "Invalid G-address" }));
    } else {
      setMemberErrors((prev) => { const n = { ...prev }; delete n[i]; return n; });
    }
  };

  const onSubmit = async (data: { name: string; threshold: number; initialFunding?: number }) => {
    if (validMembers.length < 2) return;
    if (data.threshold > validMembers.length) return;
    await onDeploy({ ...data, members: validMembers });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Board name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Board Name</label>
        <input {...register("name")} placeholder="e.g. My Project Maintainers" className="input-field w-full" />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
      </div>

      {/* Members */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Member Addresses
          <span className="text-foreground-secondary font-normal ml-2">
            ({validMembers.length} valid)
          </span>
        </label>
        <div className="flex flex-col gap-2">
          {members.map((m, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1">
                <input
                  value={m}
                  onChange={(e) => updateMember(i, e.target.value)}
                  placeholder="GABC1234..."
                  className="input-field w-full font-mono text-xs"
                />
                {memberErrors[i] && (
                  <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {memberErrors[i]}
                  </p>
                )}
              </div>
              {members.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" className="mt-2 gap-1.5" onClick={addMember}>
          <Plus className="h-3.5 w-3.5" /> Add member
        </Button>
      </div>

      {/* Threshold */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Threshold</label>
        <div className="flex items-center gap-3">
          <input
            {...register("threshold")}
            type="number"
            min={1}
            max={validMembers.length || 1}
            className="input-field w-24"
          />
          <span className="text-sm text-foreground-secondary">
            of {validMembers.length || "?"} members required
          </span>
        </div>
        {errors.threshold && (
          <p className="text-xs text-red-400 mt-1">{errors.threshold.message}</p>
        )}
      </div>

      {/* Initial funding */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Initial USDC Funding <span className="text-foreground-secondary font-normal">(optional)</span>
        </label>
        <input {...register("initialFunding")} type="number" min={0} step={0.01} placeholder="0" className="input-field w-40" />
      </div>

      {/* Preview */}
      {validMembers.length >= 2 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <p className="text-primary font-medium">
            Your board will require{" "}
            <strong>{threshold} of {validMembers.length}</strong> maintainers to approve any proposal.
          </p>
        </div>
      )}

      <Button type="submit" size="lg" disabled={isDeploying || validMembers.length < 2} className="mt-2">
        {isDeploying ? "Deploying..." : "Deploy Board"}
      </Button>
    </form>
  );
}
