"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Coins,
  Globe2,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import {
  useDeployOVault,
  getDefaultTestnetChains,
} from "@/lib/wagmi/ovault-hooks";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const setupSchema = z.object({
  assetName: z.string().min(1, "Asset name is required"),
  assetSymbol: z
    .string()
    .min(1, "Asset symbol is required")
    .max(10, "Symbol must be 10 characters or less"),
  shareName: z.string().min(1, "Share name is required"),
  shareSymbol: z
    .string()
    .min(1, "Share symbol is required")
    .max(10, "Symbol must be 10 characters or less"),
  targetChains: z.array(z.number()).min(1, "Select at least one target chain"),
  initialFunding: z.string().optional(),
});

type SetupForm = z.infer<typeof setupSchema>;

interface OVaultSetupWizardProps {
  dCorpId: string;
  dCorpName: string;
  dCorpSymbol: string;
  onComplete?: () => void;
}

export function OVaultSetupWizard({
  dCorpId,
  dCorpName,
  dCorpSymbol,
  onComplete,
}: OVaultSetupWizardProps) {
  const [step, setStep] = useState(1);
  const { address } = useAccount();
  const totalSteps = 4;

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      assetName: `${dCorpName} Asset`,
      assetSymbol: `${dCorpSymbol}A`,
      shareName: `${dCorpName} Shares`,
      shareSymbol: `${dCorpSymbol}S`,
      targetChains: [40232, 40245], // Optimism and Base Sepolia by default
      initialFunding: "0.1",
    },
  });

  const initializeOVaultMutation = api.dCorp.initializeOVault.useMutation();
  const { deployOVault, deploymentStep, isDeploying, error } =
    useDeployOVault();

  const defaultChains = getDefaultTestnetChains();

  // Watch for deployment completion and call onComplete
  useEffect(() => {
    if (deploymentStep === "completed" && onComplete) {
      // Wait a moment for the success toast to show
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deploymentStep, onComplete]);

  const onSubmit = async (data: SetupForm) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // Initialize OVault in database
      await initializeOVaultMutation.mutateAsync({
        dCorpId,
        assetName: data.assetName,
        assetSymbol: data.assetSymbol,
        shareName: data.shareName,
        shareSymbol: data.shareSymbol,
        targetChains: data.targetChains,
        initialFunding: data.initialFunding,
      });

      // Start deployment process
      await deployOVault(dCorpId, {
        assetName: data.assetName,
        assetSymbol: data.assetSymbol,
        shareName: data.shareName,
        shareSymbol: data.shareSymbol,
        targetChains: data.targetChains,
        owner: address,
      });

      // onComplete will be called automatically when deploymentStep becomes "completed"
    } catch (error) {
      console.error("Failed to initialize OVault:", error);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getStepTitle = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return "Token Configuration";
      case 2:
        return "Chain Selection";
      case 3:
        return "Initial Funding";
      case 4:
        return "Review & Deploy";
      default:
        return "";
    }
  };

  if (isDeploying) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-bold">LayerZero OVault Deployment</h2>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              HACKATHON
            </Badge>
          </div>
          <CardDescription>
            Deploying omnichain vault system across multiple testnets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deployment Progress</span>
              <span className="text-muted-foreground text-sm">
                {deploymentStep === "idle" && "Preparing deployment..."}
                {deploymentStep === "asset" && "Deploying Asset OFT..."}
                {deploymentStep === "vault" && "Deploying ERC4626 Vault..."}
                {deploymentStep === "adapter" && "Deploying Share Adapter..."}
                {deploymentStep === "composer" && "Deploying Composer..."}
                {deploymentStep === "spokes" && "Deploying to Spoke Chains..."}
                {deploymentStep === "wiring" &&
                  "Wiring Cross-Chain Connections..."}
                {deploymentStep === "completed" && "Deployment Complete!"}
              </span>
            </div>

            <Progress
              value={
                deploymentStep === "idle"
                  ? 5
                  : deploymentStep === "asset"
                    ? 16
                    : deploymentStep === "vault"
                      ? 32
                      : deploymentStep === "adapter"
                        ? 48
                        : deploymentStep === "composer"
                          ? 64
                          : deploymentStep === "spokes"
                            ? 80
                            : deploymentStep === "wiring"
                              ? 90
                              : deploymentStep === "completed"
                                ? 100
                                : 0
              }
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    [
                      "vault",
                      "adapter",
                      "composer",
                      "spokes",
                      "wiring",
                      "completed",
                    ].includes(deploymentStep)
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>Asset OFT</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    [
                      "adapter",
                      "composer",
                      "spokes",
                      "wiring",
                      "completed",
                    ].includes(deploymentStep)
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>ERC4626 Vault</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ["composer", "spokes", "wiring", "completed"].includes(
                      deploymentStep,
                    )
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>Share Adapter</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ["spokes", "wiring", "completed"].includes(deploymentStep)
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>Composer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    ["wiring", "completed"].includes(deploymentStep)
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>Spoke Chains</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    deploymentStep === "completed"
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <span>Cross-Chain Wiring</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Launching...</strong>
              <br />
              Note: this is a hackathon demo and is not production-ready.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-500" />
              <CardTitle className="text-xl">Setup LayerZero OVault</CardTitle>
            </div>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              HACKATHON DEMO
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Step {step} of {totalSteps}
            </span>
            <Progress value={(step / totalSteps) * 100} className="w-20" />
          </div>
        </div>
        <CardDescription>
          Deploy an omnichain treasury vault for {dCorpName} using LayerZero
          technology
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Coins className="h-5 w-5" />
                    {getStepTitle(1)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Configure your asset and share tokens for the omnichain
                    vault
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetName">Asset Token Name</Label>
                    <Input
                      id="assetName"
                      {...form.register("assetName")}
                      placeholder="e.g. TechCorp Asset"
                      data-1p-ignore
                    />
                    {form.formState.errors.assetName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.assetName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assetSymbol">Asset Symbol</Label>
                    <Input
                      id="assetSymbol"
                      {...form.register("assetSymbol")}
                      placeholder="e.g. TCA"
                      data-1p-ignore
                    />
                    {form.formState.errors.assetSymbol && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.assetSymbol.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareName">Share Token Name</Label>
                    <Input
                      id="shareName"
                      {...form.register("shareName")}
                      placeholder="e.g. TechCorp Shares"
                      data-1p-ignore
                    />
                    {form.formState.errors.shareName && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.shareName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareSymbol">Share Symbol</Label>
                    <Input
                      id="shareSymbol"
                      {...form.register("shareSymbol")}
                      placeholder="e.g. TCS"
                      data-1p-ignore
                    />
                    {form.formState.errors.shareSymbol && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.shareSymbol.message}
                      </p>
                    )}
                  </div>
                </div>

                <Alert>
                  <Coins className="h-4 w-4" />
                  <AlertDescription>
                    Asset tokens represent the underlying value in your vault.
                    Share tokens represent ownership stakes that can be
                    transferred cross-chain via LayerZero.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Globe2 className="h-5 w-5" />
                    {getStepTitle(2)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Select which testnets to deploy spoke contracts (hub is
                    Arbitrum Sepolia)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium">Arbitrum Sepolia</p>
                          <p className="text-muted-foreground text-sm">
                            Hub Chain (Required)
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">HUB</Badge>
                    </div>

                    {defaultChains.map((chain) => (
                      <div
                        key={chain.eid}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={form
                              .watch("targetChains")
                              .includes(chain.eid)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("targetChains");
                              if (checked) {
                                form.setValue("targetChains", [
                                  ...current,
                                  chain.eid,
                                ]);
                              } else {
                                form.setValue(
                                  "targetChains",
                                  current.filter((id) => id !== chain.eid),
                                );
                              }
                            }}
                          />
                          <div>
                            <p className="font-medium">{chain.name}</p>
                            <p className="text-muted-foreground text-sm">
                              Spoke Chain
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">TESTNET</Badge>
                      </div>
                    ))}
                  </div>

                  {form.formState.errors.targetChains && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.targetChains.message}
                    </p>
                  )}
                </div>

                <Alert>
                  <Globe2 className="h-4 w-4" />
                  <AlertDescription>
                    The hub chain hosts your ERC4626 vault. Spoke chains enable
                    cross-chain asset and share transfers via LayerZero OFTs.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Coins className="h-5 w-5" />
                    {getStepTitle(3)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Add initial funding to your treasury vault (optional)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialFunding">
                      Initial Funding (ETH)
                    </Label>
                    <Input
                      id="initialFunding"
                      type="number"
                      step="0.001"
                      {...form.register("initialFunding")}
                      placeholder="0.1"
                      data-1p-ignore
                    />
                    <p className="text-muted-foreground text-sm">
                      Leave empty to deploy without initial funding
                    </p>
                  </div>

                  <Alert>
                    <Coins className="h-4 w-4" />
                    <AlertDescription>
                      Initial funding helps establish the vault's asset-to-share
                      ratio. You can always add more funds later through the
                      dashboard.
                    </AlertDescription>
                  </Alert>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Rocket className="h-5 w-5" />
                    {getStepTitle(4)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Review your configuration and deploy the OVault system
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted grid grid-cols-2 gap-4 rounded-lg p-4">
                    <div>
                      <p className="text-sm font-medium">Asset Token</p>
                      <p className="text-muted-foreground text-sm">
                        {form.watch("assetName")} ({form.watch("assetSymbol")})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Share Token</p>
                      <p className="text-muted-foreground text-sm">
                        {form.watch("shareName")} ({form.watch("shareSymbol")})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Target Chains</p>
                      <p className="text-muted-foreground text-sm">
                        {form.watch("targetChains").length} spoke chain(s) + hub
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Initial Funding</p>
                      <p className="text-muted-foreground text-sm">
                        {form.watch("initialFunding") || "0"} ETH
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Rocket className="h-4 w-4" />
                  <AlertDescription>
                    Ready to deploy! This will create a complete omnichain vault
                    system powered by LayerZero across multiple testnets.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={initializeOVaultMutation.isPending}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Rocket className="h-4 w-4" />
                {initializeOVaultMutation.isPending
                  ? "Deploying..."
                  : "Deploy OVault"}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-6 border-t pt-6">
          <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              <a
                href="https://docs.layerzero.network"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LayerZero Docs
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Powered by LayerZero</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
