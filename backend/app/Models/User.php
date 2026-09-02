<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function reportedIncidents()
    {
        return $this->hasMany(Incident::class, 'reported_by');
    }

    public function assignedIncidents()
    {
        return $this->hasMany(Incident::class, 'assigned_to');
    }

    public function incidentUpdates()
    {
        return $this->hasMany(IncidentUpdate::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOperator(): bool
    {
        return $this->role === 'operator';
    }

    public function isReporter(): bool
    {
        return $this->role === 'reporter';
    }
}
