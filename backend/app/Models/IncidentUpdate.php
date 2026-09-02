<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncidentUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'incident_id',
        'user_id',
        'type',
        'old_status',
        'new_status',
        'comment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function incident()
    {
        return $this->belongsTo(Incident::class);
    }
}
