<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{

    // Get full profile
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Load relasi jobSeekerProfile
        $user->load('jobSeekerProfile');
        
        // Perbaiki URL foto
        if ($user->photo) {
            $user->photo = asset('storage/' . $user->photo);
        }

        return response()->json([
            'status' => 'success',
            'user' => $user
        ]);
    }
    // Update profil  
    public function update(Request $request)
    {
        $user = auth()->user();

        // 1. Validasi semua data yang masuk
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'photo' => 'nullable|image|max:2048',
            'full_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'location' => 'nullable|string',
            'education' => 'nullable|string',
            'experience' => 'nullable|string',
            'skills' => 'nullable|string',
        ]);

        // 2. Simpan Foto (jika ada) ke tabel users
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos', 'public');
            $user->photo = $path;
        }

        // 3. Update data dasar di tabel users
        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        // 4. Update ATAU Buat profil di tabel jobseeker_profiles
        $profileData = [
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'location' => $request->location,
            'education' => $request->education,
            'experience' => $request->experience,
            'skills' => $request->skills
        ];

        if ($user->jobSeekerProfile) {
            $user->jobSeekerProfile->update($profileData);
        } else {
            $user->jobSeekerProfile()->create($profileData);
        }

        // 5. Load ulang relasi untuk response
        $user->load('jobSeekerProfile');

        // Fix URL Foto
        if ($user->photo) {
            $user->photo = asset('storage/' . $user->photo);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui secara lengkap',
            'user' => $user
        ]);
    }
}
