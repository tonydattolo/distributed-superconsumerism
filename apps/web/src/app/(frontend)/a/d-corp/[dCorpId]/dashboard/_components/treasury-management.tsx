"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import { updateTreasurySchema, type UpdateTreasuryInput } from "@/lib/validations/d-corp";
import { type DCorp } from "@/server/db/schema";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  Plus,
  RefreshCw
} from "lucide-react";

interface TreasuryManagementProps {
  dCorp: DCorp;
  onTreasuryUpdate: () => void;
}

export function TreasuryManagement({ dCorp, onTreasuryUpdate }: TreasuryManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateTreasuryInput>({
    resolver: zodResolver(updateTreasurySchema),
    defaultValues: {
      amount: 0,
      operation: "add",
      notes: "",
    },
  });

  const updateTreasury = api.dCorp.updateTreasuryBalance.useMutation({
    onSuccess: () => {
      toast({
        title: "Treasury updated successfully",
        description: "The treasury balance has been updated.",
      });
      form.reset();
      setIsOpen(false);
      onTreasuryUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error updating treasury",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateTreasuryInput) => {
    updateTreasury.mutate({
      dCorpId: dCorp.id,
      ...data,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const currentBalance = parseFloat(dCorp.treasuryBalance);
  const previewAmount = form.watch("amount");
  const operation = form.watch("operation");
  
  const newBalance = operation === "add" 
    ? currentBalance + previewAmount 
    : previewAmount;

  if (!isOpen) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Treasury Management
          </CardTitle>
          <CardDescription>
            Current balance: {formatCurrency(dCorp.treasuryBalance)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => setIsOpen(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Manage Treasury
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Treasury Management
        </CardTitle>
        <CardDescription>
          Add funds or set the treasury balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Balance Display */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Balance</span>
              <Badge variant="secondary">
                {formatCurrency(dCorp.treasuryBalance)}
              </Badge>
            </div>
            
            {previewAmount > 0 && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Balance</span>
                  <div className="flex items-center gap-2">
                    {operation === "add" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                    )}
                    <Badge variant="default">
                      {formatCurrency(newBalance.toString())}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="add">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <span>Add Funds</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="set">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          <span>Set Balance</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {operation === "add" 
                      ? "Add funds to the current balance" 
                      : "Set the treasury to a specific amount"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
                    {operation === "add" 
                      ? "Amount to add to treasury" 
                      : "New treasury balance"
                    }
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
                  <Input
                    placeholder="Add notes about this treasury update..."
                    data-1p-ignore
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Internal notes about this treasury operation
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warning for Set Operation */}
          {operation === "set" && previewAmount < currentBalance && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800">Balance Reduction Warning</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    You're about to reduce the treasury balance by{" "}
                    {formatCurrency((currentBalance - previewAmount).toString())}.
                    Make sure this is intentional.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                form.reset();
              }}
              disabled={updateTreasury.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateTreasury.isPending || previewAmount <= 0}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {updateTreasury.isPending ? "Updating..." : "Update Treasury"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}