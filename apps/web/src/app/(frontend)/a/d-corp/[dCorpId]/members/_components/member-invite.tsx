"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { addMemberSchema, type AddMemberInput } from "@/lib/validations/d-corp";
import { UserPlus, Crown, Shield, User } from "lucide-react";

interface MemberInviteProps {
  dCorpId: string;
  onMemberAdded: () => void;
}

export function MemberInvite({ dCorpId, onMemberAdded }: MemberInviteProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  const addMember = api.dCorp.addMember.useMutation({
    onSuccess: () => {
      toast.success("Member added successfully");
      form.reset();
      setIsOpen(false);
      onMemberAdded();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: AddMemberInput) => {
    addMember.mutate({
      dCorpId,
      ...data,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "founder":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <UserPlus className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-medium">Add New Member</h3>
            <p className="text-muted-foreground mb-4">
              Invite new stakeholders to join your D-Corp
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Member
        </CardTitle>
        <CardDescription>
          Invite a new stakeholder to join your D-Corp
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter user ID or email address"
                    data-1p-ignore
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The unique identifier or email of the user you want to add
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Member</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="founder">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        <span>Founder</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the role for this new member
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Permissions Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              {getRoleIcon(form.watch("role"))}
              {form.watch("role")} Permissions
            </h4>
            <div className="space-y-2 text-sm">
              {form.watch("role") === "founder" && (
                <div className="space-y-1">
                  <Badge variant="default" className="mr-2">
                    Full Access
                  </Badge>
                  <p>• Create and manage distributions</p>
                  <p>• Manage all members and roles</p>
                  <p>• Treasury management</p>
                  <p>• D-Corp configuration</p>
                </div>
              )}
              {form.watch("role") === "admin" && (
                <div className="space-y-1">
                  <Badge variant="secondary" className="mr-2">
                    Administrative
                  </Badge>
                  <p>• Create and manage distributions</p>
                  <p>• Manage members (except founders)</p>
                  <p>• Treasury management</p>
                  <p>• View all data</p>
                </div>
              )}
              {form.watch("role") === "member" && (
                <div className="space-y-1">
                  <Badge variant="outline" className="mr-2">
                    Basic Access
                  </Badge>
                  <p>• View distributions</p>
                  <p>• View member list</p>
                  <p>• Access member portal</p>
                  <p>• Participate in governance</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                form.reset();
              }}
              disabled={addMember.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMember.isPending}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {addMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
