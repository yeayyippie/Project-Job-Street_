<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// relasi
use App\Models\Company;
use App\Models\Application;

class JobPost extends Model
{
    use HasFactory;

    protected $table = 'job_posts'; // sesuai migration

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'salary_range',
        'location',
        'job_type',
        'category',
        'requirements',
        'deadline',
    ];
    protected $casts = [
    'requirements' => 'array',
];

    /**
     * RELASI
     */

    // job milik company
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    // job punya banyak application
    public function applications()
    {
        return $this->hasMany(Application::class);
    }
}