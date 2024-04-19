<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'notifications';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'quotation_id',
        'type',
        'status',
        'user_id',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    protected $casts = [
        'id' => 'integer',
        'quotation_id' => 'integer',
        'user_id' => 'integer',
        'status' => 'integer',
        'type' => 'integer',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class,  'quotation_id', 'id');
    }
}
