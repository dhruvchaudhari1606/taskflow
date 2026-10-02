"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  User as UserIcon,
  Tag,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Copy,
  Check,
  Edit2,
  Plus,
  ChevronDown,
  Loader2,
  Flame,
  ArrowUpCircle,
  Circle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { PriorityBadge, StatusBadge } from "@/components/common/badge-status";
import { Task, TaskStatus, Priority, User, TaskComment } from "@/types/common";
import { MOCK_CURRENT_USER, MOCK_USERS } from "@/lib/mock-data";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useTaskComments, useAddComment } from "@/features/tasks/hooks/use-tasks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask?: (updated: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  members?: User[];
  columns?: { id: string; title: string }[];
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

function formatDueDate(dateString: string | null | undefined): {
  text: string;
  isOverdue: boolean;
} {
  if (!dateString) return { text: "Set due date", isOverdue: false };
  try {
    const due = new Date(dateString);
    if (isNaN(due.getTime())) return { text: dateString, isOverdue: false };
    const now = new Date();
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.round(
      (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
    }
    if (diffDays === 0) return { text: "Due today", isOverdue: false };
    if (diffDays === 1) return { text: "Due tomorrow", isOverdue: false };
    if (diffDays <= 7) return { text: `Due in ${diffDays}d`, isOverdue: false };
    return {
      text: due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      isOverdue: false,
    };
  } catch {
    return { text: dateString, isOverdue: false };
  }
}

/** Placeholder discussion shown on demo (non-persisted) task cards. */
function createDemoComments(taskId: string): TaskComment[] {
  const twoHoursAgo = new Date(Date.now() - 7200000).toISOString();
  return [
    {
      id: "mock-c-1",
      content:
        "Validated acceptance criteria and system telemetry benchmarks.",
      taskId,
      authorId: "user-2",
      author: {
        id: "user-2",
        name: "Alex Rivera",
        email: "alex.rivera@taskflow.io",
        avatarUrl: null,
      },
      createdAt: twoHoursAgo,
      updatedAt: twoHoursAgo,
    },
  ];
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  members = MOCK_USERS,
  columns,
}: TaskDetailModalProps) {
  // Title inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  // Description inline editing state
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  // Add tag inline state
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  // Comments state
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<TaskComment[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Live backend comments query & mutation
  const { data: serverComments, isLoading: commentsLoading } = useTaskComments(
    task?.id
  );
  const addCommentMutation = useAddComment();
  const { user } = useCurrentUser();

  // Synchronize drafts when the task (or its saved text) changes.
  // Adjusted during render rather than in an effect to avoid an extra commit.
  const taskSyncKey = task
    ? `${task.id}|${task.title}|${task.description ?? ""}`
    : null;
  const [syncedTaskKey, setSyncedTaskKey] = useState<string | null>(null);
  if (taskSyncKey !== syncedTaskKey) {
    setSyncedTaskKey(taskSyncKey);
    if (task) {
      setTitleDraft(task.title);
      setDescDraft(task.description || "");
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setIsAddingTag(false);
      setShowDeleteConfirm(false);
    }
  }

  // Synchronize comments from server (adjusted during render)
  const [syncedComments, setSyncedComments] = useState<{
    comments: typeof serverComments;
    taskId: string | undefined;
  }>({ comments: undefined, taskId: undefined });
  if (
    serverComments !== syncedComments.comments ||
    task?.id !== syncedComments.taskId
  ) {
    setSyncedComments({ comments: serverComments, taskId: task?.id });
    if (serverComments && serverComments.length > 0) {
      setLocalComments(serverComments);
    } else if (task) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          task.id
        );
      if (!isUUID) {
        // Fallback demo comment for mock cards
        setLocalComments(createDemoComments(task.id));
      } else {
        setLocalComments([]);
      }
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isEditingTitle) setIsEditingTitle(false);
        else if (isEditingDesc) setIsEditingDesc(false);
        else if (isAddingTag) setIsAddingTag(false);
        else if (showDeleteConfirm) setShowDeleteConfirm(false);
        else onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isEditingTitle, isEditingDesc, isAddingTag, showDeleteConfirm, onClose]);

  if (!isOpen || !task) return null;

  // Title save
  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === task.title) {
      setIsEditingTitle(false);
      return;
    }
    onUpdateTask?.({
      ...task,
      title: trimmed,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingTitle(false);
    toast.success("Task title updated");
  };

  // Description save
  const handleSaveDescription = () => {
    const trimmed = descDraft.trim();
    onUpdateTask?.({
      ...task,
      description: trimmed || null,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingDesc(false);
    toast.success("Description updated");
  };

  // Status change
  const handleStatusChange = (newStatusOrColumnId: TaskStatus | string) => {
    const matchedCol = columns?.find(
      (c) => c.id === newStatusOrColumnId || c.title === newStatusOrColumnId
    );
    const newStatus = matchedCol ? matchedCol.title : newStatusOrColumnId;
    const newColumnId = matchedCol ? matchedCol.id : task.columnId;

    onUpdateTask?.({
      ...task,
      status: newStatus as any,
      columnId: newColumnId,
      updatedAt: new Date().toISOString(),
    });
    toast.success("Task status updated");
  };

  // Priority change
  const handlePriorityChange = (newPriority: Priority) => {
    onUpdateTask?.({
      ...task,
      priority: newPriority,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Priority set to ${newPriority}`);
  };

  // Assignee change
  const handleAssigneeChange = (userId: string) => {
    if (!userId || userId === "unassigned") {
      onUpdateTask?.({
        ...task,
        assigneeId: null,
        assignee: null,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Task unassigned");
      return;
    }
    const member = members.find((m) => m.id === userId);
    onUpdateTask?.({
      ...task,
      assigneeId: userId,
      assignee: member || {
        id: userId,
        name: "Team Member",
        email: "member@taskflow.io",
      },
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Assigned to ${member?.name || "Team Member"}`);
  };

  // Due Date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdateTask?.({
      ...task,
      dueDate: val || null,
      updatedAt: new Date().toISOString(),
    });
    toast.success(val ? `Due date set to ${val}` : "Due date cleared");
  };

  // Tag addition
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagText.trim();
    if (!tag) return;
    if ((task.labels || []).some((l) => l.name.toLowerCase() === tag.toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }
    const newLabels = [
      ...(task.labels || []),
      {
        id: `tag-${Date.now()}-${tag}`,
        name: tag,
        color: "#4F46E5",
        workspaceId: task.projectId,
      },
    ];
    onUpdateTask?.({
      ...task,
      labels: newLabels,
      updatedAt: new Date().toISOString(),
    });
    setNewTagText("");
    setIsAddingTag(false);
    toast.success(`Tag "${tag}" added`);
  };

  // Tag removal
  const handleRemoveTag = (tagName: string) => {
    const newLabels = (task.labels || []).filter((l) => l.name !== tagName);
    onUpdateTask?.({
      ...task,
      labels: newLabels,
      updatedAt: new Date().toISOString(),
    });
    toast.success(`Tag "${tagName}" removed`);
  };

  // Copy link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/projects/${task.projectId}?taskId=${task.id}`
      );
      setCopiedLink(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Comment post
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const content = commentText.trim();
    setCommentText("");

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        task.id
      );

    if (isUUID) {
      addCommentMutation.mutate({ taskId: task.id, content });
    } else {
      // Offline / demo fallback
      const newMockComment: TaskComment = {
        id: `c-${Date.now()}`,
        content,
        taskId: task.id,
        authorId: user?.id || MOCK_CURRENT_USER.id,
        author: user || MOCK_CURRENT_USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLocalComments((prev) => [...prev, newMockComment]);
      toast.success("Comment posted");
    }
  };

  // Delete task
  const handleConfirmDelete = () => {
    onDeleteTask?.(task.id);
    onClose();
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200/90 dark:border-[#334155] overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              {task.id.length > 10 ? `#${task.id.slice(0, 8)}` : `#${task.id}`}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {task.project?.name || "Project Task"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Copy Task Link */}
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy task link"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Delete Task */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-lg">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  Delete?
                </span>
                <button
                  onClick={handleConfirmDelete}
                  className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-1.5 py-0.5 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body — Two Column Responsive Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-[#334155]">
          {/* Main Column (8 Cols on Desktop) */}
          <div className="lg:col-span-8 p-5 sm:p-6 space-y-6">
            {/* Title Section */}
            <div>
              {isEditingTitle ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveTitle();
                      }
                    }}
                    rows={2}
                    className="w-full text-lg sm:text-xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-2 border-[#4F46E5] rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none leading-snug"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingTitle(false)}
                      className="text-xs h-7 px-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveTitle}
                      className="text-xs h-7 px-3 bg-[#4F46E5] hover:bg-[#3525cd] text-white"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-start justify-between gap-3 cursor-pointer p-1 -m-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                    {task.title}
                  </h2>
                  <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Description & Specifications
                </span>
                {!isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="text-xs font-semibold text-[#4F46E5] hover:text-[#3525cd] flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={4}
                    placeholder="Add detailed acceptance criteria, background notes, or technical specifications..."
                    className="w-full text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 leading-relaxed resize-y"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingDesc(false)}
                      className="text-xs h-7 px-2.5"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDescription}
                      className="text-xs h-7 px-3 bg-[#4F46E5] hover:bg-[#3525cd] text-white"
                    >
                      Save Description
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors min-h-[70px]"
                >
                  {task.description ? (
                    task.description
                  ) : (
                    <span className="text-slate-400 italic">
                      No description provided. Click to add acceptance criteria
                      and details...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tags / Labels Section */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tags & Labels
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 group"
                    >
                      <span>#{label.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(label.name)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    No tags added yet.
                  </span>
                )}

                {isAddingTag ? (
                  <form
                    onSubmit={handleAddTag}
                    className="inline-flex items-center gap-1"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Tag name..."
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-[#4F46E5] bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-24 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-[#4F46E5] text-white text-xs font-bold rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#4F46E5] hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Discussion & Activity Feed */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#334155]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Discussion & Activity
                  </h4>
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {localComments.length}
                  </span>
                </div>
                {commentsLoading && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin text-[#4F46E5]" />
                    <span>Syncing...</span>
                  </div>
                )}
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {localComments.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-slate-50/60 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800">
                    <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      No comments yet on this task.
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Post an update or feedback below to notify the team.
                    </p>
                  </div>
                ) : (
                  localComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1.5 transition-all hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={comment.author?.avatarUrl ?? undefined}
                            fallback={comment.author?.name || "User"}
                            size="xs"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {comment.author?.name || "Team Member"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {comment.author?.email}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-7">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Add Comment Input Form */}
              <form
                onSubmit={handleAddComment}
                className="flex gap-2.5 items-start pt-2"
              >
                <Avatar
                  name={user?.name}
                  src={user?.avatarUrl ?? undefined}
                  fallback={user?.name || "User"}
                  size="sm"
                  className="mt-1 shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write a comment or status update (Ctrl+Enter to post)..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        e.key === "Enter" &&
                        commentText.trim()
                      ) {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 leading-relaxed resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">
                      Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">Ctrl+Enter</kbd> to submit
                    </span>
                    <Button
                      type="submit"
                      disabled={!commentText.trim() || addCommentMutation.isPending}
                      className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs h-8 px-3.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {addCommentMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Post Comment</span>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Column (4 Cols on Desktop) */}
          <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-50/40 dark:bg-slate-900/20 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Task Properties
            </h4>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Status
              </label>
              <select
                value={
                  columns && columns.length > 0
                    ? columns.find((c) => c.id === task.columnId)?.id ||
                      columns.find(
                        (c) =>
                          c.title.toLowerCase() ===
                          (task.status || "").toLowerCase()
                      )?.id ||
                      task.status
                    : task.status
                }
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
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
                    <option value={TaskStatus.DONE}>Done (Completed)</option>
                  </>
                )}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) =>
                  handlePriorityChange(e.target.value as Priority)
                }
                className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              >
                <option value={Priority.LOW}>Low Priority</option>
                <option value={Priority.MEDIUM}>Medium Priority</option>
                <option value={Priority.HIGH}>High Priority</option>
                <option value={Priority.URGENT}>Urgent (Critical)</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Assignee
              </label>
              <select
                value={task.assigneeId || "unassigned"}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              >
                <option value="unassigned">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Due Date
                </label>
                {task.dueDate && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      dueInfo.isOverdue
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    )}
                  >
                    {dueInfo.text}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={
                  task.dueDate
                    ? new Date(task.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleDueDateChange}
                className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 cursor-pointer"
              />
            </div>

            {/* Reporter / Creator & Timestamps */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#334155] space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reporter
                </span>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={task.createdBy?.avatarUrl ?? undefined}
                    fallback={task.createdBy?.name || "Reporter"}
                    size="xs"
                  />
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                      {task.createdBy?.name || "Sarah Mitchell"}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {task.createdBy?.email || "sarah@northstar.io"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Created
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(task.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Last Updated
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {formatRelativeTime(task.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
