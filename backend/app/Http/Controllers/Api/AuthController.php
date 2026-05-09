<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:jobseeker,employer,admin',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);

        // AUTO CREATE COMPANY UNTUK EMPLOYER
        if ($user->role === 'employer') {
            $user->company()->create([
                'company_name' => $user->name,
            ]);
        }

        return response()->json([
            'message' => 'Register berhasil',
            'user' => $user
        ], 201);
    }

    // LOGIN
  public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (!Auth::attempt($request->only('email', 'password'))) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login success',
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'photo' => $user->photo ? asset('storage/' . $user->photo) : null,
        ]
    ]);
}


    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($otp),
                'created_at' => now(),
            ]
        );

        Mail::raw(
            "Kode OTP reset password RuangKarier Anda adalah: {$otp}\n\nKode ini berlaku selama 10 menit. Abaikan email ini jika Anda tidak meminta reset password.",
            function ($message) use ($request) {
                $message->to($request->email)->subject('OTP Reset Password RuangKarier');
            }
        );

        return response()->json([
            'message' => 'OTP reset password berhasil dikirim ke email Anda.'
        ]);
    }

    public function verifyResetOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $this->validateResetOtp($request->email, $request->otp);

        return response()->json([
            'message' => 'OTP valid. Silakan buat password baru.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|digits:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $this->validateResetOtp($request->email, $request->otp);

        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password berhasil diperbarui. Silakan login kembali.'
        ]);
    }

    private function validateResetOtp(string $email, string $otp): void
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (!$record || now()->diffInMinutes($record->created_at) > 10 || !Hash::check($otp, $record->token)) {
            throw ValidationException::withMessages([
                'otp' => ['OTP tidak valid atau sudah kedaluwarsa.'],
            ]);
        }
    }
}
