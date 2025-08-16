"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Coins, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAirdropTokens } from "@/lib/wagmi/hooks";

const airdropSchema = z.object({
  stakeholderType: z.enum(["0", "1", "2"], {
    required_error: "Please select stakeholder type",
  }),
  recipients: z.array(z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    amount: z.string().min(1, "Amount required").refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a positive number"
    ),
  })).min(1, "At least one recipient required"),
});

type AirdropFormData = z.infer<typeof airdropSchema>;

const stakeholderTypes = [
  { value: "0", label: "Capital Stakeholders", color: "text-blue-600" },
  { value: "1", label: "Labor Stakeholders", color: "text-green-600" },
  { value: "2", label: "Consumer Stakeholders", color: "text-purple-600" },
];

export function AirdropForm() {
  const [bulkAddresses, setBulkAddresses] = useState("");

  const form = useForm<AirdropFormData>({
    resolver: zodResolver(airdropSchema),
    defaultValues: {
      stakeholderType: "1",
      recipients: [{ address: "", amount: "" }],
    },
  });

  const {
    airdropTokens,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  } = useAirdropTokens();

  const addRecipient = () => {
    const currentRecipients = form.getValues("recipients");
    form.setValue("recipients", [...currentRecipients, { address: "", amount: "" }]);
  };

  const removeRecipient = (index: number) => {
    const currentRecipients = form.getValues("recipients");
    if (currentRecipients.length > 1) {
      form.setValue("recipients", currentRecipients.filter((_, i) => i !== index));
    }
  };

  const processBulkAddresses = () => {
    if (!bulkAddresses.trim()) return;

    const lines = bulkAddresses.trim().split('\n');
    const newRecipients = lines
      .map(line => {
        const [address, amount] = line.split(',').map(s => s.trim());
        return { address: address ?? "", amount: amount ?? "1" };
      })
      .filter(recipient => recipient.address);

    if (newRecipients.length > 0) {
      form.setValue("recipients", newRecipients);
      setBulkAddresses("");
      toast.success(`Added ${newRecipients.length} recipients`);
    }
  };

  const onSubmit = (data: AirdropFormData) => {
    const addresses = data.recipients.map(r => r.address);
    const amounts = data.recipients.map(r => r.amount);
    const stakeholderType = parseInt(data.stakeholderType) as 0 | 1 | 2;

    airdropTokens(addresses, amounts, stakeholderType);
  };

  const selectedType = stakeholderTypes.find(type => type.value === form.watch("stakeholderType"));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Airdrop
        </CardTitle>
        <CardDescription>
          Distribute tokens to multiple addresses for different stakeholder classes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Stakeholder Type Selection */}
            <FormField
              control={form.control}
              name="stakeholderType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stakeholder Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stakeholder type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stakeholderTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className={type.color}>{type.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bulk Address Input */}
            <div className="space-y-2">
              <FormLabel>Bulk Add Recipients (Optional)</FormLabel>
              <Textarea
                placeholder="Format: address,amount (one per line)&#10;0x123...,10&#10;0x456...,5"
                value={bulkAddresses}
                onChange={(e) => setBulkAddresses(e.target.value)}
                className="h-20"
                data-1p-ignore
              />
              <Button
                type="button"
                variant="outline"
                onClick={processBulkAddresses}
                disabled={!bulkAddresses.trim()}
              >
                Process Bulk Addresses
              </Button>
            </div>

            {/* Individual Recipients */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Recipients</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipient
                </Button>
              </div>

              {form.watch("recipients").map((_, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`recipients.${index}.address`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        {index === 0 && <FormLabel>Address</FormLabel>}
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0x..."
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`recipients.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        {index === 0 && <FormLabel>Amount</FormLabel>}
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0"
                            type="number"
                            step="0.01"
                            data-1p-ignore
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("recipients").length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Blockchain Transaction Status */}
            {(hash ?? error) && (
              <div className="p-4 border rounded-lg bg-muted/50">
                {hash && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Airdrop Transaction</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Hash: {hash}
                    </p>
                    {isConfirming && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">⛏️ Processing airdrop...</p>
                    )}
                    {isConfirmed && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✅ Airdrop completed to {form.getValues("recipients").length} recipients!
                      </p>
                    )}
                  </div>
                )}
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    ❌ Airdrop Error: {error.shortMessage ?? error.message}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending ?? isConfirming}
              className="w-full"
            >
              {isPending 
                ? "🔗 Sign Transaction..." 
                : isConfirming 
                ? "🪂 Processing Airdrop..." 
                : `Airdrop to ${selectedType?.label}`}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}