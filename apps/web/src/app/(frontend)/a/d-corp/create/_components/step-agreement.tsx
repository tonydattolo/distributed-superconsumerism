"use client";

import { type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Users, TrendingUp } from "lucide-react";
import { type CreateDCorpInput } from "@/lib/validations/d-corp";

interface StepAgreementProps {
  form: UseFormReturn<CreateDCorpInput>;
}

export function StepAgreement({ form }: StepAgreementProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold">Formation Agreement</h3>
        <p className="text-muted-foreground">
          Review and accept the legal attestations required to launch your
          D-Corp
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          These attestations are legally binding and cannot be changed after
          launch. Please read each carefully before proceeding.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-red-500" />
              Fiduciary Duty Waiver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Traditional corporations have fiduciary duties to maximize
              shareholder value. D-Corps operate under a different model that
              balances stakeholder interests.
            </p>
            <FormField
              control={form.control}
              name="attestations.waiveFiduciaryDuty"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I acknowledge that this D-Corp waives traditional
                      fiduciary duties to shareholders in favor of a
                      multi-stakeholder model that considers capital, labor, and
                      consumer interests.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Distribution Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Your D-Corp will distribute profits according to the percentages
              you&apos;ve configured. This creates a binding commitment to share
              value with all stakeholder classes.
            </p>
            <FormField
              control={form.control}
              name="attestations.agreeToDistribution"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I commit to distributing profits according to the
                      configured percentages:
                      {` ${form.watch("distributionConfig.capital")}% Capital, ${form.watch("distributionConfig.labor")}% Labor, ${form.watch("distributionConfig.consumers")}% Consumers`}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-green-500" />
              D-Corp Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground mb-4 text-sm">
              <p className="mb-2">
                D-Corps operate under these core principles:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Transparent and equitable profit distribution</li>
                <li>Democratic participation in governance</li>
                <li>Value creation for all stakeholder classes</li>
                <li>Sustainable and responsible business practices</li>
                <li>Open and auditable operations</li>
              </ul>
            </div>
            <FormField
              control={form.control}
              name="attestations.agreeToPrinciples"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      I agree to operate this D-Corp according to the principles
                      of distributed capitalism and multi-stakeholder value
                      creation.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-4">
        <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">Legal Notice</h4>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          By proceeding, you&apos;re creating a legally binding entity. These
          attestations will be recorded on the blockchain and cannot be
          modified. Please consult legal counsel if you have questions about
          these commitments.
        </p>
      </div>
    </div>
  );
}
