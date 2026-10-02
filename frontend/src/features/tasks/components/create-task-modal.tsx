"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  ChevronDown,
  Check,
  User,
  UserX,
  Search,
  Tag,
  Flag,
  Columns,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { Task, TaskStatus, Priority } from "@/types/common";
import { MOCK_USERS, MOCK_CURRENT_USER } from "@/lib/mock-data";
import { useCreateTask } from "../hooks/use-tasks";
import { useProject } from "@/features/projects/hooks/use-projects";
import {
  useWorkspaces,
  useWorkspaceMembers,
  useWorkspaceDetails,
} from "@/features/workspace/hooks/use-workspaces";
import { useAuthStore } from "@/stores/auth-store";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (newTask: Task) => void;
  defaultStatus?: TaskStatus | string;
  projectId?: string;
  columns?: { id: string; title: string }[];
}

interface AssigneeOption {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role?: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onTaskCreated,
  defaultStatus = TaskStatus.TODO,
  projectId = "proj-1",
  columns,
}: CreateTaskModalProps) {
  const createTaskMutation = useCreateTask();
  const { activeWorkspace } = useWorkspaces();
  const { user: currentUser } = useAuthStore();

  // Load project to find its workspace
  const { data: projectData } = useProject(projectId);
  const targetWorkspaceId =
    projectData?.workspace_id ||
    (projectData as any)?.workspace?.id ||
    activeWorkspace?.id;

  // Load workspace members
  const { data: workspaceMembersData = [] } = useWorkspaceMembers(targetWorkspaceId);
  const { data: workspaceDetailsData } = useWorkspaceDetails(targetWorkspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>(defaultStatus);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState<string>("unassigned");
  const [tag, setTag] = useState("Frontend");

  // Custom Assignee Dropdown UI State
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAssigneeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Follow the column the modal was opened from
  const [syncedDefaultStatus, setSyncedDefaultStatus] = useState(defaultStatus);
  if (defaultStatus !== syncedDefaultStatus) {
    setSyncedDefaultStatus(defaultStatus);
    setStatus(defaultStatus);
  }

  // Build members list strictly for this workspace / project
  const availableMembers: AssigneeOption[] = React.useMemo(() => {
    const rawList =
      workspaceMembersData.length > 0
        ? workspaceMembersData
        : workspaceDetailsData?.members || [];

    if (rawList.length > 0) {
      return rawList
        .filter((m: any) => Boolean(m.user))
        .map((m: any) => ({
          id: m.user.id,
          name:
            m.user.name ||
            `${m.user.first_name || ""} ${m.user.last_name || ""}`.trim() ||
            m.user.email,
          email: m.user.email,
          avatarUrl: m.user.avatar_url || null,
          role: m.role,
        }));
    }

    // Fallback if local mock demo workspace is active
    if (!targetWorkspaceId || targetWorkspaceId.startsWith("ws-")) {
      return MOCK_USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: "Member",
      }));
    }

    // Default to current user if member list not loaded yet
    if (currentUser) {
      return [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: null,
          role: "Member",
        },
      ];
    }

    return [];
  }, [workspaceMembersData, workspaceDetailsData, targetWorkspaceId, currentUser]);

  // Set default assignee to current user if available and unassigned
  // (adjusted during render; converges in one pass once an assignee is set)
  if (assigneeId === "unassigned" && availableMembers.length > 0) {
    const match = availableMembers.find((m) => m.id === currentUser?.id);
    setAssigneeId(match ? match.id : availableMembers[0].id);
  }

  if (!isOpen) return null;

  const selectedAssignee = availableMembers.find((m) => m.id === assigneeId);

  const filteredMembers = availableMembers.filter((m) => {
    if (!assigneeSearch.trim()) return true;
    const q = assigneeSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetCol = columns?.find((c) => c.id === status || c.title === status);
    const colId = targetCol ? targetCol.id : undefined;
    const taskStatus = targetCol ? targetCol.title : status;
    const effectiveAssigneeId =
      assigneeId && assigneeId !== "unassigned" ? assigneeId : undefined;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId);
    if (isUUID) {
      try {
        const created = await createTaskMutation.mutateAsync({
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          status: taskStatus as TaskStatus,
          column_id: colId,
          priority,
          assignee_id: effectiveAssigneeId,
          tags: [tag],
        });
        onTaskCreated(created);
        onClose();
        setTitle("");
        setDescription("");
        return;
      } catch {
        // Error toast handled by mutation
      }
    }

    const assignedUser =
      availableMembers.find((u) => u.id === assigneeId) ||
      MOCK_USERS.find((u) => u.id === assigneeId) ||
      MOCK_CURRENT_USER;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || null,
      status: taskStatus as TaskStatus,
      columnId: colId || null,
      priority,
      projectId,
      project: { id: projectId, name: projectData?.name || "Project Task" },
      assigneeId: effectiveAssigneeId || null,
      assignee: effectiveAssigneeId
        ? {
            id: assignedUser.id,
            name: assignedUser.name,
            email: assignedUser.email,
            avatarUrl: assignedUser.avatarUrl || null,
          }
        : null,
      createdById: currentUser?.id || MOCK_CURRENT_USER.id,
      createdBy: {
        id: currentUser?.id || MOCK_CURRENT_USER.id,
        name: currentUser?.name || MOCK_CURRENT_USER.name,
        email: currentUser?.email || MOCK_CURRENT_USER.email,
      },
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      labels: [
        {
          id: `l-${Date.now()}`,
          name: tag,
          color:
            tag === "Frontend"
              ? "#4F46E5"
              : tag === "Backend"
              ? "#0051d5"
              : tag === "Security"
              ? "#059669"
              : "#7e3000",
          workspaceId: targetWorkspaceId || "ws-alpha",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onTaskCreated(newTask);
    onClose();
    setTitle("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200/80 dark:border-[#334155] overflow-visible animate-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] dark:bg-[#818cf8]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Task
            </h3>
            {projectData?.name && (
              <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {projectData.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement webhook retry queue..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Description / Acceptance Criteria
            </label>
            <textarea
              rows={3}
              placeholder="Add key deliverables, edge cases, or API specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Column Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              >
                {columns && columns.length > 0 ? (
                  columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={TaskStatus.TODO}>Backlog (To Do)</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.IN_REVIEW}>In Review</option>
                    <option value={TaskStatus.DONE}>Done</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              >
                <option value={Priority.LOW}>Low Priority</option>
                <option value={Priority.MEDIUM}>Medium Priority</option>
                <option value={Priority.HIGH}>High Priority</option>
                <option value={Priority.URGENT}>Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ─── CUSTOM SHADCN-STYLE ASSIGNEE DROPDOWN ─── */}
            <div className="relative" ref={assigneeDropdownRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Assignee
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                className="w-full h-10 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 flex items-center justify-between gap-2 shadow-2xs hover:border-[#4F46E5]/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {selectedAssignee ? (
                    <>
                      <Avatar
                        src={selectedAssignee.avatarUrl ?? undefined}
                        fallback={selectedAssignee.name}
                        size="xs"
                      />
                      <span className="truncate font-medium text-slate-900 dark:text-white">
                        {selectedAssignee.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <UserX className="w-3 h-3" />
                      </div>
                      <span className="text-slate-400">Unassigned</span>
                    </>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                    isAssigneeDropdownOpen ? "rotate-180 text-[#4F46E5]" : ""
                  }`}
                />
              </button>

              {/* Floating Dropdown Menu */}
              {isAssigneeDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-[#131b2e] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
                  {/* Search box if list has multiple members */}
                  {availableMembers.length > 3 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search project members..."
                          value={assigneeSearch}
                          onChange={(e) => setAssigneeSearch(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-h-56 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                    {/* Unassigned Item */}
                    <button
                      type="button"
                      onClick={() => {
                        setAssigneeId("unassigned");
                        setIsAssigneeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        assigneeId === "unassigned"
                          ? "bg-[#4F46E5]/10 text-[#4F46E5] font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <UserX className="w-3.5 h-3.5" />
                        </div>
                        <span>Unassigned</span>
                      </div>
                      {assigneeId === "unassigned" && (
                        <Check className="w-3.5 h-3.5 text-[#4F46E5]" />
                      )}
                    </button>

                    {/* Member Items */}
                    {filteredMembers.map((member) => {
                      const isSelected = assigneeId === member.id;
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setAssigneeId(member.id);
                            setIsAssigneeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#4F46E5]/10 text-[#4F46E5] font-bold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate text-left">
                            <Avatar
                              src={member.avatarUrl ?? undefined}
                              fallback={member.name}
                              size="xs"
                            />
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 dark:text-white truncate">
                                {member.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {member.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {member.role && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {member.role}
                              </span>
                            )}
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#4F46E5]" />
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {filteredMembers.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No members found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Discipline Tag */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Discipline Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Design</option>
                <option value="DevOps">DevOps</option>
                <option value="Security">Security</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold h-10 px-5 rounded-xl shadow-xs cursor-pointer"
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
