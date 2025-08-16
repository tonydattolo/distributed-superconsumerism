"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { createDistributionSchema, type CreateDistributionInput } from "@/lib/validations/d-corp";
import { type DCorp } from "@/server/db/schema";
import { DollarSign, Percent, ArrowDown } from "lucide-react";

interface DistributionFormProps {
  dCorp: DCorp;
  onSuccess?: () => void;
}

export function DistributionForm({ dCorp, onSuccess }: DistributionFormProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const form = useForm<CreateDistributionInput>({
    resolver: zodResolver(createDistributionSchema),
    defaultValues: {
      totalAmount: 0,
      quarter: "",
      notes: "",
    },
  });

  const totalAmount = form.watch("totalAmount");

  const createDistribution = api.dCorp.createDistribution.useMutation({
    onSuccess: () => {
      toast({
        title: "Distribution created successfully",
        description: "The distribution has been scheduled for processing.",
      });
      form.reset();
      setIsPreviewMode(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error creating distribution",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateDistributionInput) => {
    createDistribution.mutate({
      ...data,
      dCorpId: dCorp.id,
    });
  };

  const calculateAmount = (percentage: number, total: number) => {
    return (total * percentage) / 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `${year}-Q${quarter}`;
  };

  if (isPreviewMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribution Preview</CardTitle>
          <CardDescription>
            Review the distribution breakdown before processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Distribution Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quarter:</span>
                    <Badge variant="secondary">{form.getValues("quarter")}</Badge>
                  </div>
                  {form.getValues("notes") && (
                    <div>
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">
                        {form.getValues("notes")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Allocation Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium">Capital ({dCorp.capitalPercentage}%)</span>
                    </div>
                    <span className="font-mono">
                      {formatCurrency(calculateAmount(dCorp.capitalPercentage, totalAmount))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Labor ({dCorp.laborPercentage}%)</span>
                    </div>
                    <span className="font-mono">
                      {formatCurrency(calculateAmount(dCorp.laborPercentage, totalAmount))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="font-medium">Consumers ({dCorp.consumerPercentage}%)</span>
                    </div>
                    <span className="font-mono">
                      {formatCurrency(calculateAmount(dCorp.consumerPercentage, totalAmount))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(false)}
                disabled={createDistribution.isPending}
              >
                Back to Edit
              </Button>
              <Button
                type="submit"
                disabled={createDistribution.isPending}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {createDistribution.isPending ? "Processing..." : "Create Distribution"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Create Distribution
        </CardTitle>
        <CardDescription>
          Distribute profits to all stakeholder classes according to configured percentages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          setIsPreviewMode(true);
        }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Distribution Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10"
                        data-1p-ignore
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Total amount to distribute from treasury
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quarter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarter</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getCurrentQuarter()}
                      data-1p-ignore
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Quarter identifier (e.g., 2024-Q1)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add notes about this distribution..."
                    className="min-h-[80px]"
                    data-1p-ignore
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Internal notes about this distribution
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {totalAmount > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Quick Preview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Capital ({dCorp.capitalPercentage}%):</span>
                  <span className="font-mono">
                    {formatCurrency(calculateAmount(dCorp.capitalPercentage, totalAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Labor ({dCorp.laborPercentage}%):</span>
                  <span className="font-mono">
                    {formatCurrency(calculateAmount(dCorp.laborPercentage, totalAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Consumers ({dCorp.consumerPercentage}%):</span>
                  <span className="font-mono">
                    {formatCurrency(calculateAmount(dCorp.consumerPercentage, totalAmount))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={!form.formState.isValid || totalAmount <= 0}>
              <ArrowDown className="w-4 h-4 mr-2" />
              Preview Distribution
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}