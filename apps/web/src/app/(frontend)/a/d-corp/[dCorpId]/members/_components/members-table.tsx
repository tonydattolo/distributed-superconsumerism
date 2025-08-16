"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { type DCorpMember } from "@/server/db/schemas/d-corps-schema";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Crown,
  Shield,
  User,
  Calendar,
  Trash2,
} from "lucide-react";

interface MembersTableProps {
  dCorpId: string;
  members: DCorpMember[];
  onMemberUpdate: () => void;
}

export function MembersTable({
  dCorpId,
  members,
  onMemberUpdate,
}: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const updateMemberRole = api.dCorp.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Member role updated");
      onMemberUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMember = api.dCorp.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed");
      onMemberUpdate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.walletAddress?.includes(searchTerm);
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "founder":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "founder":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleRoleUpdate = (
    memberId: string,
    newRole: "founder" | "admin" | "member",
  ) => {
    updateMemberRole.mutate({
      memberId,
      role: newRole,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    removeMember.mutate({
      memberId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Members ({members.length})
        </CardTitle>
        <CardDescription>Manage D-Corp members and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-1p-ignore
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-background rounded-md border px-3 py-2"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founders</option>
            <option value="admin">Admins</option>
            <option value="member">Members</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center">
                    <User className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground">
                      {members.length === 0
                        ? "No members found"
                        : "No members match your filters"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getRoleIcon(member.role)}
                        <div>
                          <p className="font-medium">{member.userId}</p>
                          <p className="text-muted-foreground text-sm">
                            Member ID: {member.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(member.joinedAt), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={
                              updateMemberRole.isPending ||
                              removeMember.isPending
                            }
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {member.role !== "founder" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleUpdate(member.id, "founder")
                              }
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Make Founder
                            </DropdownMenuItem>
                          )}
                          {member.role !== "admin" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleUpdate(member.id, "admin")
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {member.role !== "member" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleUpdate(member.id, "member")
                              }
                            >
                              <User className="mr-2 h-4 w-4" />
                              Make Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove Member
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove this member
                                  from the D-Corp? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Role Distribution Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-yellow-50 p-4 text-center">
            <Crown className="mx-auto mb-2 h-6 w-6 text-yellow-600" />
            <div className="text-lg font-semibold">
              {members.filter((m) => m.role === "founder").length}
            </div>
            <div className="text-muted-foreground text-sm">Founders</div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <Shield className="mx-auto mb-2 h-6 w-6 text-blue-600" />
            <div className="text-lg font-semibold">
              {members.filter((m) => m.role === "admin").length}
            </div>
            <div className="text-muted-foreground text-sm">Admins</div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <User className="mx-auto mb-2 h-6 w-6 text-gray-600" />
            <div className="text-lg font-semibold">
              {members.filter((m) => m.role === "member").length}
            </div>
            <div className="text-muted-foreground text-sm">Members</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
