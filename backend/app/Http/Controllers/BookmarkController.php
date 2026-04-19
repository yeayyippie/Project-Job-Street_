<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bookmark;

class BookmarkController extends Controller
{
    // Tambah bookmark
   public function store(Request $request)
{
    $request->validate([
        'job_post_id' => 'required|exists:job_posts,id',
    ]);

    $existing = Bookmark::where('user_id', auth()->id())
                        ->where('job_post_id', $request->job_post_id)
                        ->first();

    if ($existing) {
        return response()->json([
            'message' => 'Bookmark sudah ada',
            'data' => $existing
        ], 200);
    }

    $bookmark = Bookmark::create([
        'user_id' => auth()->id(),
        'job_post_id' => $request->job_post_id,
    ]);

    return response()->json([
        'message' => 'Bookmark ditambahkan',
        'data' => $bookmark
    ], 201);
}

    // Lihat bookmark user
    public function index(Request $request)
    {
        return Bookmark::with('jobPost')
            ->where('user_id', auth()->id())
            ->get();
    }

    // Hapus bookmark
    public function destroy($id)
    {
        $bookmark = Bookmark::where('user_id', auth()->id())->findOrFail($id);
        $bookmark->delete();

        return response()->json([
            'message' => 'Bookmark dihapus'
        ]);
    }
}
