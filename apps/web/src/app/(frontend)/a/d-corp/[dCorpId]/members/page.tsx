"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { MembersTable } from "./_components/members-table";
import { MemberInvite } from "./_components/member-invite";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MembersPageProps {
  params: Promise<{
    dCorpId: string;
  }>;
}

export default function MembersPage({ params }: MembersPageProps) {
  const { dCorpId } = use(params);

  const { data: dCorp, isLoading: dCorpLoading } = api.dCorp.getById.useQuery(
    { dCorpId },
    { enabled: !!dCorpId }
  );

  const { 
    data: members, 
    isLoading: membersLoading, 
    refetch: refetchMembers 
  } = api.dCorp.getMembers.useQuery(
    { dCorpId },
    { enabled: !!dCorpId }
  );

  const isLoading = dCorpLoading || membersLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Invite Card Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-12 mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-10 w-24 mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="flex gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dCorp) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            D-Corp not found or you don't have access to this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/a/d-corp/${dCorpId}/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage stakeholders and roles for {dCorp.name}
          </p>
        </div>
      </div>

      {/* Add Member Section */}
      <MemberInvite 
        dCorpId={dCorpId} 
        onMemberAdded={() => refetchMembers()}
      />

      {/* Members Table */}
      {members && (
        <MembersTable 
          dCorpId={dCorpId}
          members={members} 
          onMemberUpdate={() => refetchMembers()}
        />
      )}
    </div>
  );
}