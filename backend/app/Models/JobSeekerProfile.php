<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// import relasi
use App\Models\User;

class JobSeekerProfile extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'location',
        'education',
        'experience',
        'skills',
        'cv_file',
        'photo',
    ];

    protected $casts = [
        'skills' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}