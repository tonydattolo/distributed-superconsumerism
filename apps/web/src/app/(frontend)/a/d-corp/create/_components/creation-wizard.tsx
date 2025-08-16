"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  createDCorpSchema,
  type CreateDCorpInput,
} from "@/lib/validations/d-corp";

import { StepBasics } from "./step-basics";
import { StepDistribution } from "./step-distribution";
import { StepAgreement } from "./step-agreement";
import { StepReview } from "./step-review";

const steps = [
  { id: 1, title: "Basics", description: "Name and description" },
  { id: 2, title: "Distribution", description: "Profit sharing setup" },
  { id: 3, title: "Agreement", description: "Legal attestations" },
  { id: 4, title: "Review", description: "Final review" },
];

export function CreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const form = useForm<CreateDCorpInput>({
    resolver: zodResolver(createDCorpSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      distributionConfig: {
        capital: 20,
        labor: 40,
        consumers: 40,
      },
      attestations: {
        waiveFiduciaryDuty: false,
        agreeToDistribution: false,
        agreeToPrinciples: false,
      },
    },
  });

  const createDCorp = api.dCorp.create.useMutation({
    onSuccess: (dCorp) => {
      toast.success(`${dCorp.name} has been launched.`);
      router.push(`/a/d-corp/${dCorp.id}/dashboard`);
    },
    onError: (error) => {
      toast.error("Error creating D-Corp", {
        description: error.message,
      });
    },
  });

  const nextStep = async () => {
    const currentStepValid = await form.trigger(getFieldsForStep(currentStep));
    if (currentStepValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: CreateDCorpInput) => {
    createDCorp.mutate(data);
  };

  const getFieldsForStep = (step: number): (keyof CreateDCorpInput)[] => {
    switch (step) {
      case 1:
        return ["name", "symbol", "description"];
      case 2:
        return ["distributionConfig"];
      case 3:
        return ["attestations"];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics form={form} />;
      case 2:
        return <StepDistribution form={form} />;
      case 3:
        return <StepAgreement form={form} />;
      case 4:
        return <StepReview form={form} />;
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Your D-Corp</h1>
        <p className="text-muted-foreground mt-2">
          Launch a new Distributed Corporation with custom profit distribution
        </p>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  step.id <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    step.id <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-muted-foreground text-xs">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="bg-muted mx-4 hidden h-0.5 w-12 sm:block" />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {steps[currentStep - 1]?.title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1]?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createDCorp.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createDCorp.isPending ? "Creating..." : "Launch D-Corp"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
