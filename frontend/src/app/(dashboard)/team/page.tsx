"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Shield,
  MoreVertical,
  Mail,
  CheckCircle2,
  X,
  Sparkles,
  Award,
  Clock,
  Copy,
  Check,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { RoleBadge } from "@/components/common/badge-status";
import { MOCK_USERS, MOCK_WORKSPACE } from "@/lib/mock-data";
import { Role } from "@/types/common";
import {
  useWorkspaces,
  useWorkspaceDetails,
  useWorkspaceMembers,
  useWorkspaceInvitations,
  useInviteMember,
  useRevokeInvitation,
} from "@/features/workspace/hooks/use-workspaces";
import { toast } from "sonner";

interface MemberWithRole {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Away";
  avatarUrl?: string | null;
}

export default function TeamPage() {
  const { activeWorkspace } = useWorkspaces();
  const { data: workspaceData, isLoading: workspaceLoading } = useWorkspaceDetails(
    activeWorkspace?.id
  );
  const { data: workspaceMembersData } = useWorkspaceMembers(activeWorkspace?.id);
  const { data: invitationsData = [] } = useWorkspaceInvitations(activeWorkspace?.id);
  const inviteMemberMutation = useInviteMember();
  const revokeInvitationMutation = useRevokeInvitation();

  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Build the member list from server data, or demo data for mock workspaces (adjusted during render rather than in an effect)
  const [syncedDeps, setSyncedDeps] = useState<unknown[] | null>(null);
  if (!syncedDeps || syncedDeps[0] !== workspaceData || syncedDeps[1] !== workspaceMembersData || syncedDeps[2] !== activeWorkspace) {
    setSyncedDeps([workspaceData, workspaceMembersData, activeWorkspace]);
    const rawMembers = workspaceMembersData || workspaceData?.members;
    if (rawMembers && rawMembers.length > 0) {
      const serverMembers: MemberWithRole[] = rawMembers.map((m: any) => ({
        id: m.user?.id || m.id,
        name:
          m.user?.name ||
          `${m.user?.first_name || ""} ${m.user?.last_name || ""}`.trim() ||
          m.user?.email ||
          "Team Member",
        email: m.user?.email || "",
        role:
          m.role?.toUpperCase() === "OWNER"
            ? Role.OWNER
            : m.role?.toUpperCase() === "ADMIN"
            ? Role.ADMIN
            : Role.MEMBER,
        status: "Active",
        avatarUrl: m.user?.avatar_url || null,
      }));
      setMembers(serverMembers);
    } else if (!activeWorkspace?.id || activeWorkspace.id.startsWith("ws-")) {
      // Fallback demo mock if mock workspace is selected
      setMembers([
        {
          id: "user-1",
          name: "Sarah Mitchell",
          email: "sarah.mitchell@taskflow.io",
          role: Role.OWNER,
          status: "Active",
          avatarUrl: MOCK_USERS[0].avatarUrl,
        },
        {
          id: "user-2",
          name: "Alex Rivera",
          email: "alex.rivera@taskflow.io",
          role: Role.ADMIN,
          status: "Active",
          avatarUrl: null,
        },
      ]);
    }
  }

  const filteredMembers = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const filteredInvitations = invitationsData.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return inv.email.toLowerCase().includes(q);
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace?.id) return;

    try {
      const res = await inviteMemberMutation.mutateAsync({
        workspaceId: activeWorkspace.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res?.invitation?.inviteLink) {
        setGeneratedInviteLink(res.invitation.inviteLink);
      } else {
        setInviteModalOpen(false);
        setInviteEmail("");
      }
    } catch {
      // Toast handled by mutation
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Invitation link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRevoke = (invitationId: string) => {
    if (!activeWorkspace?.id) return;
    revokeInvitationMutation.mutate({
      workspaceId: activeWorkspace.id,
      invitationId,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              {activeWorkspace?.name || MOCK_WORKSPACE.name}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500">Access Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Team Members & Roles
          </h1>
        </div>

        <div>
          <Button
            onClick={() => {
              setGeneratedInviteLink(null);
              setInviteModalOpen(true);
            }}
            className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-10 px-4 shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </Button>
        </div>
      </div>

      {/* Workspace Plan Meter Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Growth Plan Seats
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {members.length + invitationsData.length} of 10 Seats Used
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {invitationsData.length > 0
              ? `${members.length} active members and ${invitationsData.length} pending invitations.`
              : "Invite teammates with full real-time collaboration before upgrading."}
          </p>
        </div>

        <div className="w-full sm:w-48 space-y-1">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="bg-[#4F46E5] h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  ((members.length + invitationsData.length) / 10) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right font-semibold">
            {Math.max(10 - (members.length + invitationsData.length), 0)} seats available
          </p>
        </div>
      </div>

      {/* Tabs & Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "members"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Members ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("invitations")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "invitations"
                ? "bg-[#4F46E5] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Invitations ({invitationsData.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === "members"
                ? "Search by name or email..."
                : "Search invited email..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-[#faf8ff] dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
          />
        </div>
      </div>

      {/* ─── TAB A: ACTIVE MEMBERS TABLE ─── */}
      {activeTab === "members" && (
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf8ff] dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatarUrl ?? undefined}
                          fallback={member.name}
                          size="sm"
                          isOnline={member.status === "Active"}
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-slate-400 sm:hidden">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {member.email}
                    </td>

                    <td className="py-4 px-6">
                      <RoleBadge role={member.role} />
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {member.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB B: PENDING INVITATIONS TABLE ─── */}
      {activeTab === "invitations" && (
        <div className="bg-white dark:bg-[#131b2e] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          {filteredInvitations.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No Pending Invitations
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All invited teammates have registered or there are no pending invites currently active.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf8ff] dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Invited Email</th>
                    <th className="py-3.5 px-6">Assigned Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Expires In</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvitations.map((inv) => {
                    const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/accept-invite?token=${inv.token}`;
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 font-bold text-xs">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                                {inv.email}
                              </p>
                              {inv.inviter?.name && (
                                <p className="text-[10px] text-slate-400">
                                  Invited by {inv.inviter.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <RoleBadge
                            role={
                              inv.role?.toUpperCase() === "ADMIN"
                                ? Role.ADMIN
                                : Role.MEMBER
                            }
                          />
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <Clock className="w-3 h-3" />
                            Pending Invite
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                          {new Date(inv.expires_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleCopyLink(inviteUrl)}
                              title="Copy invitation link"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </button>

                            <button
                              onClick={() => handleRevoke(inv.id)}
                              title="Revoke invitation"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── INVITE MEMBER MODAL ─── */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invite Teammate to {activeWorkspace?.name || "Workspace"}
              </h3>
              <button
                onClick={() => {
                  setInviteModalOpen(false);
                  setGeneratedInviteLink(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {generatedInviteLink ? (
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Invitation Created Successfully!</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    An email was dispatched to <strong>{inviteEmail}</strong>. You can also share the direct invite link below:
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Direct Invitation URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteLink}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                    <Button
                      type="button"
                      onClick={() => handleCopyLink(generatedInviteLink)}
                      className="shrink-0 bg-[#4F46E5] text-white text-xs h-9 px-3 rounded-xl cursor-pointer"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    onClick={() => {
                      setInviteModalOpen(false);
                      setGeneratedInviteLink(null);
                      setInviteEmail("");
                    }}
                    className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-9 px-4 rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="dhruvtestcheckpoint@yopmail.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    If this user doesn&apos;t have an account, an invitation link will be created for them.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Role & Permissions
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                  >
                    <option value={Role.MEMBER}>Member (Can view, edit, and assign tasks)</option>
                    <option value={Role.ADMIN}>Admin (Can manage projects, invites, & settings)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteModalOpen(false)}
                    className="text-xs h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={inviteMemberMutation.isPending}
                    className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-10 px-5 rounded-xl shadow-xs cursor-pointer"
                  >
                    {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
