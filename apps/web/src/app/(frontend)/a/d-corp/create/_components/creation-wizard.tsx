"use client";

import { useState, useEffect } from "react";
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
import { useCreateDCorp } from "@/lib/wagmi/hooks";
import { Form } from "@/components/ui/form";
import { useAccount } from "wagmi";

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
  const [isBlockchainStep, setIsBlockchainStep] = useState(false);
  const router = useRouter();
  const { address: walletAddress } = useAccount();

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

  // Blockchain hook for creating D-Corp on-chain
  const {
    createDCorp: createDCorpOnChain,
    hash,
    isPending: isBlockchainPending,
    isConfirming,
    isConfirmed,
    error: blockchainError,
  } = useCreateDCorp();

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

  const onSubmit = async (data: CreateDCorpInput) => {
    setIsBlockchainStep(true);
    
    // First, create the D-Corp on-chain
    createDCorpOnChain(
      data.name,
      data.symbol,
      data.distributionConfig.capital,
      data.distributionConfig.labor,
      data.distributionConfig.consumers
    );
  };

  // Handle blockchain transaction completion
  useEffect(() => {
    if (isConfirmed && hash && walletAddress) {
      // After blockchain transaction is confirmed, save to database
      const formData = form.getValues();
      createDCorp.mutate({
        ...formData,
        founderWalletAddress: walletAddress,
        blockchainTxHash: hash,
      });
      setIsBlockchainStep(false);
    }
  }, [isConfirmed, hash, createDCorp, form, walletAddress]);

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

  // Show wallet connection message if no wallet is connected
  if (!walletAddress) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8">
            Please connect your Ethereum wallet to create a D-Corp.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

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
          <Form {...form}>
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

            {/* Blockchain Transaction Status */}
            {(hash ?? blockchainError) && (
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                {hash && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Blockchain Transaction</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Hash: {hash}
                    </p>
                    {isConfirming && (
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">⛏️ Mining transaction...</p>
                    )}
                    {isConfirmed && (
                      <p className="text-sm text-green-600 dark:text-green-400">✅ Transaction confirmed!</p>
                    )}
                  </div>
                )}
                {blockchainError && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    ❌ Blockchain Error: {blockchainError.shortMessage ?? blockchainError.message}
                  </div>
                )}
              </div>
            )}

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
                  disabled={isBlockchainPending ?? isConfirming ?? createDCorp.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isBlockchainPending 
                    ? "🔗 Sign Transaction..." 
                    : isConfirming 
                    ? "⛏️ Mining Transaction..." 
                    : createDCorp.isPending 
                    ? "💾 Saving to Database..." 
                    : "🚀 Launch D-Corp"}
                </Button>
              )}
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
