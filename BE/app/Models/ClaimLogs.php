<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClaimLogs extends Model
{
    use HasFactory;

    protected $table = 'claim_logs';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'claim_id',
        'claim_progress_id',
        'created_at',
        'updated_at',
    ];
}
