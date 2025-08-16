"use client";

import { type UseFormReturn } from "react-hook-form";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { type CreateDCorpInput } from "@/lib/validations/d-corp";

interface StepDistributionProps {
  form: UseFormReturn<CreateDCorpInput>;
}

const COLORS = {
  capital: "#3b82f6", // blue
  labor: "#10b981", // green
  consumers: "#f59e0b", // amber
};

export function StepDistribution({ form }: StepDistributionProps) {
  const distributionConfig = form.watch("distributionConfig");

  const chartData = [
    { name: "Capital", value: distributionConfig.capital, color: COLORS.capital },
    { name: "Labor", value: distributionConfig.labor, color: COLORS.labor },
    { name: "Consumers", value: distributionConfig.consumers, color: COLORS.consumers },
  ];

  const total = distributionConfig.capital + distributionConfig.labor + distributionConfig.consumers;
  const isValid = total === 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Profit Distribution Configuration</h3>
        <p className="text-muted-foreground">
          Set how profits will be distributed among different stakeholder classes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="distributionConfig.capital"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Capital Providers</span>
                  <span className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {field.value}%
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      // Auto-adjust others to maintain 100% total
                      const remaining = 100 - value[0]!;
                      const currentLabor = form.getValues("distributionConfig.labor");
                      const currentConsumers = form.getValues("distributionConfig.consumers");
                      const currentTotal = currentLabor + currentConsumers;
                      
                      if (currentTotal > 0) {
                        const laborRatio = currentLabor / currentTotal;
                        const consumerRatio = currentConsumers / currentTotal;
                        
                        form.setValue("distributionConfig.labor", Math.round(remaining * laborRatio));
                        form.setValue("distributionConfig.consumers", Math.round(remaining * consumerRatio));
                      }
                    }}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Percentage allocated to investors and capital providers
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributionConfig.labor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Labor Contributors</span>
                  <span className="text-sm font-mono bg-green-100 text-green-800 px-2 py-1 rounded">
                    {field.value}%
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      // Auto-adjust others to maintain 100% total
                      const remaining = 100 - value[0]!;
                      const currentCapital = form.getValues("distributionConfig.capital");
                      const currentConsumers = form.getValues("distributionConfig.consumers");
                      const currentTotal = currentCapital + currentConsumers;
                      
                      if (currentTotal > 0) {
                        const capitalRatio = currentCapital / currentTotal;
                        const consumerRatio = currentConsumers / currentTotal;
                        
                        form.setValue("distributionConfig.capital", Math.round(remaining * capitalRatio));
                        form.setValue("distributionConfig.consumers", Math.round(remaining * consumerRatio));
                      }
                    }}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Percentage allocated to workers and contributors
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distributionConfig.consumers"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Consumers</span>
                  <span className="text-sm font-mono bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    {field.value}%
                  </span>
                </FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                      // Auto-adjust others to maintain 100% total
                      const remaining = 100 - value[0]!;
                      const currentCapital = form.getValues("distributionConfig.capital");
                      const currentLabor = form.getValues("distributionConfig.labor");
                      const currentTotal = currentCapital + currentLabor;
                      
                      if (currentTotal > 0) {
                        const capitalRatio = currentCapital / currentTotal;
                        const laborRatio = currentLabor / currentTotal;
                        
                        form.setValue("distributionConfig.capital", Math.round(remaining * capitalRatio));
                        form.setValue("distributionConfig.labor", Math.round(remaining * laborRatio));
                      }
                    }}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Percentage allocated to customers and users
                </FormDescription>
              </FormItem>
            )}
          />

          <div className={`p-4 rounded-lg border ${isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Total:</span>
              <span className={`font-mono text-lg ${isValid ? "text-green-800" : "text-red-800"}`}>
                {total}%
              </span>
            </div>
            {!isValid && (
              <p className="text-sm text-red-700 mt-1">
                Distribution must total exactly 100%
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Allocation"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Capital: Investment returns, dividends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Labor: Work contributions, value creation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Consumers: Usage-based rewards, loyalty</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h4 className="font-medium text-amber-900 mb-2">Distribution Guidelines</h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Capital allocation typically ranges from 10-40%</li>
          <li>• Labor allocation should reflect the value of human contribution</li>
          <li>• Consumer allocation creates network effects and loyalty</li>
          <li>• These percentages are locked after launch</li>
        </ul>
      </div>
    </div>
  );
}