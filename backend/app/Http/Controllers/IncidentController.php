<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Models\IncidentUpdate;
use App\Models\User;
use Illuminate\Http\Request;

class IncidentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Incident::with(['reporter', 'assignee']);

        // Reporters only see their own incidents
        if ($user->isReporter()) {
            $query->where('reported_by', $user->id);
        }

        // Filters
        if ($request->filled('severity')) {
            $query->where('severity', $request->severity);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $incidents = $query->orderBy('created_at', 'desc')->get();

        return response()->json($incidents);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:low,medium,high,critical',
        ]);

        $incident = Incident::create([
            'title' => $request->title,
            'description' => $request->description,
            'severity' => $request->severity,
            'status' => 'open',
            'reported_by' => $request->user()->id,
        ]);

        // Audit log
        IncidentUpdate::create([
            'incident_id' => $incident->id,
            'user_id' => $request->user()->id,
            'type' => 'status_change',
            'old_status' => null,
            'new_status' => 'open',
            'comment' => 'Incident created.',
        ]);

        return response()->json($incident->load(['reporter', 'assignee']), 201);
    }

    public function show(Request $request, Incident $incident)
    {
        $user = $request->user();

        if ($user->isReporter() && $incident->reported_by !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json($incident->load(['reporter', 'assignee', 'updates.user']));
    }

    public function updateStatus(Request $request, Incident $incident)
    {
        $request->validate([
            'status' => 'required|in:open,investigating,resolved,closed',
            'comment' => 'nullable|string',
        ]);

        $newStatus = $request->status;

        if (! $incident->canTransitionTo($newStatus)) {
            return response()->json([
                'message' => "Invalid status transition from '{$incident->status}' to '{$newStatus}'. ".
                             'Allowed next status: '.(Incident::STATUS_FLOW[$incident->status] ?? 'none').'.',
            ], 422);
        }

        $oldStatus = $incident->status;
        $incident->update(['status' => $newStatus]);

        IncidentUpdate::create([
            'incident_id' => $incident->id,
            'user_id' => $request->user()->id,
            'type' => 'status_change',
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'comment' => $request->comment,
        ]);

        return response()->json($incident->load(['reporter', 'assignee', 'updates.user']));
    }

    public function addComment(Request $request, Incident $incident)
    {
        $user = $request->user();

        if ($user->isReporter() && $incident->reported_by !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $request->validate([
            'comment' => 'required|string',
        ]);

        IncidentUpdate::create([
            'incident_id' => $incident->id,
            'user_id' => $user->id,
            'type' => 'comment',
            'comment' => $request->comment,
        ]);

        return response()->json($incident->load(['reporter', 'assignee', 'updates.user']));
    }

    public function assign(Request $request, Incident $incident)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $assignee = User::findOrFail($request->assigned_to);

        if (! in_array($assignee->role, ['operator', 'admin'])) {
            return response()->json(['message' => 'Can only assign to operators or admins.'], 422);
        }

        $incident->update(['assigned_to' => $request->assigned_to]);

        IncidentUpdate::create([
            'incident_id' => $incident->id,
            'user_id' => $request->user()->id,
            'type' => 'assignment',
            'comment' => "Assigned to {$assignee->name}.",
        ]);

        return response()->json($incident->load(['reporter', 'assignee', 'updates.user']));
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $query = Incident::query();

        if ($user->isReporter()) {
            $query->where('reported_by', $user->id);
        }

        $counts = [
            'open' => (clone $query)->where('status', 'open')->count(),
            'investigating' => (clone $query)->where('status', 'investigating')->count(),
            'resolved' => (clone $query)->where('status', 'resolved')->count(),
            'closed' => (clone $query)->where('status', 'closed')->count(),
        ];

        $bySeverity = [
            'low' => (clone $query)->where('severity', 'low')->count(),
            'medium' => (clone $query)->where('severity', 'medium')->count(),
            'high' => (clone $query)->where('severity', 'high')->count(),
            'critical' => (clone $query)->where('severity', 'critical')->count(),
        ];

        $recent = (clone $query)
            ->with(['reporter', 'assignee'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'counts' => $counts,
            'bySeverity' => $bySeverity,
            'recent' => $recent,
        ]);
    }
}
