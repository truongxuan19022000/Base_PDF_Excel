<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'roles';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'role_name',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'number_user' => 'integer',
    ];

    protected $hidden = [];

    public function rolePermissions()
    {
        return $this->hasMany(RolePermission::class, 'role_id', 'id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'role_id', 'id');
    }
}
