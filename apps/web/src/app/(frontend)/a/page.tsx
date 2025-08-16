"use client";

import { Building2, Users, DollarSign, Zap, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Distributed Corporation Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Revolutionary corporate structure that eliminates fiduciary duty and ensures equitable profit distribution 
          among capital providers, laborers, and consumers through transparent blockchain governance.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button asChild size="lg">
            <Link href="/a/d-corp/create">
              <Plus className="mr-2 h-4 w-4" />
              Launch Your D-Corp
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/a/d-corp">
              View Existing D-Corps
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Create D-Corp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Launch a new Distributed Corporation with custom profit distribution settings. 
              Attest to removing fiduciary duty and commit to equitable sharing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Engage Stakeholders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Define rewardable actions for labor and consumer participation. 
              Create opportunities and manage work submissions through transparent attestation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Distribute Profits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Execute quarterly profit distributions automatically based on your configured percentages 
              across capital, labor, and consumer stakeholder classes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Revolutionary Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">No Fiduciary Duty</h3>
            <p className="text-sm text-muted-foreground">
              Eliminates traditional corporate governance constraints
            </p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Multi-Stakeholder</h3>
            <p className="text-sm text-muted-foreground">
              Capital, labor, and consumers all share in success
            </p>
          </div>
          <div className="text-center">
            <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Transparent Governance</h3>
            <p className="text-sm text-muted-foreground">
              Blockchain-based attestation and distribution
            </p>
          </div>
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Automated Distribution</h3>
            <p className="text-sm text-muted-foreground">
              Smart contracts ensure fair profit sharing
            </p>
          </div>
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-muted-foreground">Active D-Corps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">$0</div>
              <p className="text-muted-foreground">Total Treasury</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">0</div>
              <p className="text-muted-foreground">Stakeholders</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
