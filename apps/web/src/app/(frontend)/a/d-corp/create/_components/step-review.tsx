"use client";

import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Building2, FileText, TrendingUp, Shield, CheckCircle } from "lucide-react";
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
    { name: "Capital", value: formData.distributionConfig.capital, color: COLORS.capital },
    { name: "Labor", value: formData.distributionConfig.labor, color: COLORS.labor },
    { name: "Consumers", value: formData.distributionConfig.consumers, color: COLORS.consumers },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Your D-Corp</h3>
        <p className="text-muted-foreground">
          Please review all details before launching your Distributed Corporation
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{formData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Symbol</label>
              <Badge variant="secondary" className="text-sm font-mono">
                {formData.symbol}
              </Badge>
            </div>
            {formData.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
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
            <div className="h-48 mb-4">
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
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Capital
                </span>
                <span className="font-mono">{formData.distributionConfig.capital}%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Labor
                </span>
                <span className="font-mono">{formData.distributionConfig.labor}%</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  Consumers
                </span>
                <span className="font-mono">{formData.distributionConfig.consumers}%</span>
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
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Fiduciary Duty Waiver</p>
              <p className="text-sm text-muted-foreground">
                Waived traditional shareholder-first fiduciary duties in favor of multi-stakeholder model
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Distribution Commitment</p>
              <p className="text-sm text-muted-foreground">
                Committed to distributing profits according to the configured percentages
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">D-Corp Principles</p>
              <p className="text-sm text-muted-foreground">
                Agreed to operate under distributed capitalism and multi-stakeholder principles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Ready to Launch</h4>
            <p className="text-sm text-blue-700 mb-3">
              Your D-Corp is configured and ready for launch. Once created, these settings
              cannot be modified. The D-Corp will be registered on the blockchain and
              you'll receive management access.
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• Blockchain registration will take 2-3 minutes</p>
              <p>• You'll be redirected to your admin dashboard</p>
              <p>• Initial treasury will be set to $0 (add funds later)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}