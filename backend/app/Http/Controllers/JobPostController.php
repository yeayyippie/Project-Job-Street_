<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\JobPost;
use App\Services\SkillMatchService;
use Illuminate\Support\Facades\Auth;
class JobPostController extends Controller
{

    public function index(Request $request){
    $query = JobPost::with('company');

    // SEARCH
    if ($request->filled('search')) {
        $query->where(function ($q) use ($request) {
            $q->where('title', 'like', '%' . $request->search . '%')
              ->orWhere('description', 'like', '%' . $request->search . '%');
        });
    }

    // LOCATION
    if ($request->filled('location')) {
        $query->where('location', 'like', '%' . $request->location . '%');
    }

    // JOB TYPE
    if ($request->filled('job_type')) {
        $query->where('job_type', $request->job_type);
    }

    // CATEGORY
    if ($request->filled('category')) {
        $query->where('category', $request->category);
    }

    // PAGINATION
    $jobs = $query->paginate(4);

    // USER LOGIN
    $user = Auth::user();

    // MATCHING (HANYA JIKA JOBSEEKER)
    if ($user && $user->role === 'jobseeker' && $user->jobSeekerProfile && $user->jobSeekerProfile->skills) {
        $service = new SkillMatchService();

        foreach ($jobs->items() as $job) {
            $job->match_score = $service->calculate(
                $user->jobSeekerProfile->skills,
                $job->requirements
            );
        }
    }

    return response()->json($jobs); 
    }  

    // CREATE job
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required',
            'location' => 'required',
            'job_type' => 'required',
            'deadline' => 'required|date',
        ]);

        try {
            $job = JobPost::create([
                // AMAN: ambil dari user login
                'company_id' => auth()->user()->company->id,

                'title' => $request->title,
                'description' => $request->description,
                'salary_range' => $request->salary_range,
                'location' => $request->location,
                'job_type' => $request->job_type,
                'category' => $request->category,
                'requirements' => $request->requirements,
                'deadline' => $request->deadline,
            ]);

            return response()->json([
                'message' => 'Job berhasil dibuat',
                'data' => $job
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Terjadi kesalahan saat membuat job',
                'debug' => $e->getMessage()
            ], 500);
        }
    }

    // GET detail job
public function show($id)
{
    $job = JobPost::with('company')->findOrFail($id);

    $user = Auth::user();

    if ($user && $user->role === 'jobseeker' && $user->jobSeekerProfile && $user->jobSeekerProfile->skills) {
        $service = new SkillMatchService();

        $job->match_score = $service->calculate(
            $user->jobSeekerProfile->skills,
            $job->requirements
        );
    }

    return response()->json($job);
}

    // UPDATE job
    public function update(Request $request, $id)
    {
        $job = JobPost::findOrFail($id);

        // pastikan hanya pemilik yang bisa update
        if ($job->company_id !== auth()->user()->company->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        $job->update($request->only([
            'title',
            'description',
            'salary_range',
            'location',
            'job_type',
            'category',
            'requirements',
            'deadline'
        ]));

        return response()->json([
            'message' => 'Job berhasil diupdate',
            'data' => $job
        ]);
    }

    // DELETE job 
    public function destroy($id)
    {
        $job = JobPost::findOrFail($id);

        // hanya pemilik bisa hapus
        if ($job->company_id !== auth()->user()->company->id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job berhasil dihapus'
        ]);
    }

    public function myJobsWithApplicants(Request $request)
{
    $user = $request->user();

    // ambil company milik user
    $company = $user->company;

    if (!$company) {
        return response()->json([
            'message' => 'User belum punya company'
        ], 404);
    }

    // ambil job + pelamar
    $jobs = $company->jobs()->with([
        'applications.user'
    ])->get();

    return response()->json($jobs);
}

}