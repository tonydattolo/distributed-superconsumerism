"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp
} from "lucide-react";
import { type Distribution } from "@/server/db/schema";

interface DistributionHistoryProps {
  distributions: Distribution[];
}

export function DistributionHistory({ distributions }: DistributionHistoryProps) {
  const [expandedDistributions, setExpandedDistributions] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleExpanded = (distributionId: string) => {
    const newExpanded = new Set(expandedDistributions);
    if (newExpanded.has(distributionId)) {
      newExpanded.delete(distributionId);
    } else {
      newExpanded.add(distributionId);
    }
    setExpandedDistributions(newExpanded);
  };

  const totalDistributed = distributions.reduce(
    (sum, dist) => sum + parseFloat(dist.totalAmount),
    0
  );

  if (distributions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distribution History
          </CardTitle>
          <CardDescription>
            Past distributions and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Distributions Yet</h3>
            <p className="text-muted-foreground">
              Create your first distribution to see it here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Distribution History
        </CardTitle>
        <CardDescription>
          {distributions.length} distributions • {formatCurrency(totalDistributed.toString())} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distributions.map((distribution) => (
            <Collapsible key={distribution.id}>
              <div className="border rounded-lg p-4">
                <CollapsibleTrigger
                  className="w-full"
                  onClick={() => toggleExpanded(distribution.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedDistributions.has(distribution.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{distribution.quarter}</span>
                          <Badge className={getStatusColor(distribution.status)}>
                            {distribution.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(distribution.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(distribution.totalAmount)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total distributed
                      </p>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    {/* Distribution Breakdown */}
                    <div>
                      <h4 className="font-medium mb-3">Distribution Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">Capital</span>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(distribution.capitalAmount)}
                          </div>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium">Labor</span>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(distribution.laborAmount)}
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-sm font-medium">Consumers</span>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(distribution.consumerAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2">
                          {format(new Date(distribution.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      {distribution.processedAt && (
                        <div>
                          <span className="text-muted-foreground">Processed:</span>
                          <span className="ml-2">
                            {format(new Date(distribution.processedAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {distribution.notes && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notes
                        </h4>
                        <p className="text-sm p-3 bg-muted rounded-lg">
                          {distribution.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {distribution.status === "completed" && (
                        <Button size="sm" variant="outline">
                          Download Report
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}