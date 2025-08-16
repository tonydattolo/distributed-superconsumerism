"use client";

import { type UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  Building2,
  FileText,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import { type CreateDCorpInput } from "@/lib/validations/d-corp";

interface StepReviewProps {
  form: UseFormReturn<CreateDCorpInput>;
}

const COLORS = {
  capital: "#3b82f6",
  labor: "#10b981",
  consumers: "#f59e0b",
};

export function StepReview({ form }: StepReviewProps) {
  const formData = form.getValues();

  const chartData = [
    {
      name: "Capital",
      value: formData.distributionConfig.capital,
      color: COLORS.capital,
    },
    {
      name: "Labor",
      value: formData.distributionConfig.labor,
      color: COLORS.labor,
    },
    {
      name: "Consumers",
      value: formData.distributionConfig.consumers,
      color: COLORS.consumers,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Review Your D-Corp</h3>
        <p className="text-muted-foreground">
          Please review all details before launching your Distributed
          Corporation
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Name
              </label>
              <p className="text-lg font-semibold">{formData.name}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm font-medium">
                Symbol
              </label>
              <Badge variant="secondary" className="font-mono text-sm">
                {formData.symbol}
              </Badge>
            </div>
            {formData.description && (
              <div>
                <label className="text-muted-foreground text-sm font-medium">
                  Description
                </label>
                <p className="text-sm">{formData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Profit Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  Capital
                </span>
                <span className="font-mono">
                  {formData.distributionConfig.capital}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  Labor
                </span>
                <span className="font-mono">
                  {formData.distributionConfig.labor}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  Consumers
                </span>
                <span className="font-mono">
                  {formData.distributionConfig.consumers}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Attestations
          </CardTitle>
          <CardDescription>
            Confirmed legal commitments for your D-Corp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <div>
              <p className="font-medium">Fiduciary Duty Waiver</p>
              <p className="text-muted-foreground text-sm">
                Waived traditional shareholder-first fiduciary duties in favor
                of multi-stakeholder model
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <div>
              <p className="font-medium">Distribution Commitment</p>
              <p className="text-muted-foreground text-sm">
                Committed to distributing profits according to the configured
                percentages
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <div>
              <p className="font-medium">D-Corp Principles</p>
              <p className="text-muted-foreground text-sm">
                Agreed to operate under distributed capitalism and
                multi-stakeholder principles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
              Ready to Launch
            </h4>
            <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
              Your D-Corp is configured and ready for launch. Once created,
              these settings cannot be modified. The D-Corp will be registered
              on the blockchain and you&apos;ll receive management access.
            </p>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <p>• Blockchain registration will take 2-3 minutes</p>
              <p>• You&apos;ll be redirected to your admin dashboard</p>
              <p>• Initial treasury will be set to $0 (add funds later)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
