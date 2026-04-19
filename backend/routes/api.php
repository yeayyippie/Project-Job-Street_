<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\JobPostController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CompanyController; 

// PUBLIC ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/jobs', [JobPostController::class, 'index']);
Route::get('/jobs/{id}', [JobPostController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile', [ProfileController::class, 'show']);

    // Rute baru yang diminta
    Route::get('/profile', [ProfileController::class, 'index']);    // Ambil data profil (menggunakan index)
    Route::post('/profile', [ProfileController::class, 'update']);  // Update profil via POST

    // Employer profile routes
    Route::get('/employer/profile', [CompanyController::class, 'getProfile']);
    Route::post('/employer/profile', [CompanyController::class, 'updateProfile']);

    // EMPLOYER + ADMIN
    Route::middleware('role:employer,admin')->group(function () {
        Route::post('/jobs', [JobPostController::class, 'store']);
        Route::put('/jobs/{id}', [JobPostController::class, 'update']);
        Route::delete('/jobs/{id}', [JobPostController::class, 'destroy']);

        // Route update status lamaran (tanpa prefix employer)
        Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
        
        // Route dengan prefix employer (opsional, untuk konsistensi)
        Route::patch('/employer/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

        Route::get('/employer/jobs', [JobPostController::class, 'myJobsWithApplicants']);
        Route::get('/jobs/{id}/applications', [ApplicationController::class, 'listByJob']);
    });

    // JOBSEEKER
    Route::middleware('role:jobseeker')->group(function () {
        Route::post('/apply', [ApplicationController::class, 'apply']);
        Route::get('/my-applications', [ApplicationController::class, 'myApplications']);
        Route::post('/bookmarks', [BookmarkController::class, 'store']);
        Route::get('/bookmarks', [BookmarkController::class, 'index']);
        Route::delete('/bookmarks/{id}', [BookmarkController::class, 'destroy']);
        Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);

        Route::post('/upload-cv', [ProfileController::class, 'uploadCv']);
    });
        
});