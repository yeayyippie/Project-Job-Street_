<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


// import model relasi (untuk relasi)
use App\Models\JobSeekerProfile;
use App\Models\Company;
use App\Models\Application;
use App\Models\Bookmark;


class User extends Authenticatable
{
     use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', 
        'photo',
        'cv_file',  
    ];

    /**
     * Kolom yang disembunyikan
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Casting data
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => 'string',
    ];

    /**
     * =========================
     * RELASI
     * =========================
     */

    // 1 user = 1 jobseeker profile
    public function jobSeekerProfile()
    {
        return $this->hasOne(JobSeekerProfile::class);
    }

    // 1 user = 1 company
    public function company()
    {
        return $this->hasOne(Company::class);
    }
    

    // 1 user = banyak applications
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    // 1 user = banyak bookmarks
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }
}