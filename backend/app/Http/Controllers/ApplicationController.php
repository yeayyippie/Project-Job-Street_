<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Application;

class ApplicationController extends Controller
{
    // 🔹 APPLY JOB
    public function apply(Request $request)
{
    $request->validate([
        'job_post_id' => 'required|exists:job_posts,id',
        'cv_file' => 'required|mimes:pdf,doc,docx|max:5120', // max 5MB
        'cover_letter' => 'nullable|string',
    ]);

    // Simpan file CV ke storage
    $path = $request->file('cv_file')->store('cv_files', 'public');

    $application = Application::create([
        'job_post_id' => $request->job_post_id,
        'user_id' => auth()->id(),
        'cv_file' => $path,
        'cover_letter' => $request->cover_letter,
        'status' => 'applied',
    ]);

    return response()->json([
        'message' => 'Lamaran berhasil dikirim',
        'application' => $application
    ]);
}

    // 🔹 LIHAT LAMARAN USER
    public function myApplications(Request $request)
    {
        return Application::with('jobPost')
            ->where('user_id', $request->user()->id)
            ->get();
    }

        // 🔹 List LAMARAN USER
    public function listByJob($id)
{
    // ambil semua aplikasi untuk job tertentu
    $applications = Application::where('job_post_id', $id)
        ->with('user') // relasi ke user yang apply
        ->get();

    return response()->json([
        'job_post_id' => $id,
        'applications' => $applications
    ]);
}

// Fungsi untuk Employer mengubah status lamaran
    public function updateStatus(Request $request, $id)
    {
        // Validasi status yang dikirim
        $request->validate([
            'status' => 'required|in:accepted,rejected,pending'
        ]);

        // Cari data lamaran berdasarkan ID
        $application = \App\Models\Application::findOrFail($id);
        
        // Update statusnya
        $application->status = $request->status;
        $application->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status lamaran berhasil diubah!',
            'data' => $application
        ]);
    }

    public function destroy($id)
{
    $application = \App\Models\Application::where('id', $id)
        ->where('user_id', auth()->id()) // biar aman (hanya milik sendiri)
        ->first();

    if (!$application) {
        return response()->json([
            'message' => 'Application tidak ditemukan'
        ], 404);
    }

    $application->delete();

    return response()->json([
        'message' => 'Application berhasil dihapus'
    ]);
}
}

