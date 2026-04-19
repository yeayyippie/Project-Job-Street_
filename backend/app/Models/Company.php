<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\User;
use App\Models\JobPost;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'user_id',
        'company_name',
        'logo',
        'description',
        'industry',
        'location',
        'website',
    ];

    // 1 company milik 1 user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 1 company punya banyak job post
    public function jobs()
    {
        return $this->hasMany(JobPost::class);
    }
}