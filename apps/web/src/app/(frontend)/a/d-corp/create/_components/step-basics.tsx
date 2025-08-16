"use client";

import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { type CreateDCorpInput } from "@/lib/validations/d-corp";

interface StepBasicsProps {
  form: UseFormReturn<CreateDCorpInput>;
}

export function StepBasics({ form }: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>D-Corp Name</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Acme Distributed Corp"
                data-1p-ignore
                {...field}
              />
            </FormControl>
            <FormDescription>
              The public name for your Distributed Corporation
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="symbol"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Symbol</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., ACME"
                maxLength={10}
                className="uppercase"
                data-1p-ignore
                {...field}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormDescription>
              A short identifier for your D-Corp (max 10 characters)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your D-Corp's mission and purpose..."
                className="min-h-[100px]"
                data-1p-ignore
                {...field}
              />
            </FormControl>
            <FormDescription>
              Explain what your D-Corp does and its core mission
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="rounded-lg border p-4">
        <h3 className="mb-2 font-medium">What is a D-Corp?</h3>
        <p>
          A Distributed Corporation is a new form of organization that
          distributes profits among capital providers, labor contributors, and
          consumers based on predetermined percentages. It operates
          transparently on blockchain technology.
        </p>
      </div>
    </div>
  );
}
