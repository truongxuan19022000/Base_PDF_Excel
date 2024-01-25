<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'documents';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'document_name',
        'customer_id',
        'file',
        'file_type',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    public function getFileAttribute($value)
    {
        return asset($value);
    }
}
