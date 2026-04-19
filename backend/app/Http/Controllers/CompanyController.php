<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Company;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    // Mengambil data profil perusahaan saat ini
    public function getProfile(Request $request)
    {
        // Cari company berdasarkan user yang sedang login
        $company = Company::where('user_id', Auth::id())->first();
        
        return response()->json([
            'status' => 'success',
            'data' => $company
        ]);
    }

    // Menyimpan atau memperbarui profil perusahaan
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        // Validasi input dari React
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'industry'     => 'nullable|string|max:255',
            'location'     => 'nullable|string|max:255',
            'description'  => 'nullable|string',
            'website'      => 'nullable|string|max:255',
            'photo'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // dari input file di React
        ]);

        // Cari profil company yang sudah ada, atau buat instance baru jika belum ada
        $company = Company::firstOrNew(['user_id' => $user->id]);

        // Masukkan data
        $company->company_name = $validated['company_name'];
        $company->industry     = $validated['industry'];
        $company->location     = $validated['location'];
        $company->description  = $validated['description'];
        $company->website      = $validated['website'];

        // Jika ada upload foto logo
        if ($request->hasFile('photo')) {
            // Simpan ke folder storage/app/public/logos
            $path = $request->file('photo')->store('logos', 'public');
            $company->logo = $path; 

            // CARA BRUTAL: Paksa update langsung ke database menggunakan Query Builder
            \App\Models\User::where('id', $user->id)->update([
                'photo' => $path
            ]);
            
            // Perbarui juga data object $user yang akan dikirim kembali ke React
            $user->photo = $path; 
        }

            $company->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Profil perusahaan berhasil disimpan!',
                'data' => $company,
                'user' => $user // Kembalikan data user terbaru ke React
            ]);
    }
}