<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\IncidentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [IncidentController::class, 'dashboard']);

    // Incidents — Reporters can create & view own; Operators/Admin can update
    Route::get('/incidents', [IncidentController::class, 'index']);
    Route::get('/incidents/{incident}', [IncidentController::class, 'show']);
    Route::post('/incidents', [IncidentController::class, 'store'])
        ->middleware('role:reporter,operator,admin');
    Route::patch('/incidents/{incident}/status', [IncidentController::class, 'updateStatus'])
        ->middleware('role:operator,admin');
    Route::post('/incidents/{incident}/comment', [IncidentController::class, 'addComment']);
    Route::patch('/incidents/{incident}/assign', [IncidentController::class, 'assign'])
        ->middleware('role:admin');

    // Users — Admin only
    Route::get('/users', [UserController::class, 'index'])
        ->middleware('role:admin');
    Route::get('/users/operators', [UserController::class, 'operators']);
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('role:admin');
    Route::patch('/users/{user}', [UserController::class, 'update'])
        ->middleware('role:admin');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->middleware('role:admin');
});
