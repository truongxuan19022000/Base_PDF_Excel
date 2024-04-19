<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RolePermission extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'role_permission';

    protected $fillable = [
        'role_id',
        'permission_id',
        'mode',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id', 'id');
    }

    protected $casts = [
        'role_id' => 'integer',
        'permission_id' => 'integer',
    ];
}
