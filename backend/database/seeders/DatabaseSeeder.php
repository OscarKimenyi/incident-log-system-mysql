<?php

namespace Database\Seeders;

use App\Models\Incident;
use App\Models\IncidentUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@incidentlog.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Operators
        $operator1 = User::create([
            'name' => 'Alice Operator',
            'email' => 'alice@incidentlog.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        $operator2 = User::create([
            'name' => 'Bob Operator',
            'email' => 'bob@incidentlog.com',
            'password' => Hash::make('password'),
            'role' => 'operator',
        ]);

        // Create Reporters
        $reporter1 = User::create([
            'name' => 'Charlie Reporter',
            'email' => 'charlie@incidentlog.com',
            'password' => Hash::make('password'),
            'role' => 'reporter',
        ]);

        $reporter2 = User::create([
            'name' => 'Diana Reporter',
            'email' => 'diana@incidentlog.com',
            'password' => Hash::make('password'),
            'role' => 'reporter',
        ]);

        // Sample Incidents
        $incidents = [
            [
                'title' => 'Database server unresponsive',
                'description' => 'The primary database server is not responding to connections since 14:00 EAT.',
                'severity' => 'critical',
                'status' => 'investigating',
                'reported_by' => $reporter1->id,
                'assigned_to' => $operator1->id,
            ],
            [
                'title' => 'Login page returning 500 error',
                'description' => 'Users are unable to log in. The login endpoint returns HTTP 500.',
                'severity' => 'high',
                'status' => 'open',
                'reported_by' => $reporter2->id,
                'assigned_to' => null,
            ],
            [
                'title' => 'Email notifications delayed',
                'description' => 'Email delivery is delayed by up to 2 hours affecting all users.',
                'severity' => 'medium',
                'status' => 'resolved',
                'reported_by' => $reporter1->id,
                'assigned_to' => $operator2->id,
            ],
            [
                'title' => 'Minor UI glitch on dashboard',
                'description' => 'The dashboard pie chart overlaps with the filter panel on small screens.',
                'severity' => 'low',
                'status' => 'closed',
                'reported_by' => $reporter2->id,
                'assigned_to' => $operator1->id,
            ],
            [
                'title' => 'API rate limiting too aggressive',
                'description' => 'Third-party integrations hitting rate limits unexpectedly during peak hours.',
                'severity' => 'high',
                'status' => 'open',
                'reported_by' => $reporter1->id,
                'assigned_to' => null,
            ],
        ];

        foreach ($incidents as $data) {
            $incident = Incident::create($data);

            // Seed an initial audit log entry
            IncidentUpdate::create([
                'incident_id' => $incident->id,
                'user_id' => $data['reported_by'],
                'type' => 'status_change',
                'old_status' => null,
                'new_status' => 'open',
                'comment' => 'Incident reported.',
            ]);
        }
    }
}
