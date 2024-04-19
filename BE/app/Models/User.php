<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use PhpParser\Node\NullableType;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, SoftDeletes;
    protected $table = 'users';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'role_id',
        'username',
        'name',
        'email',
        'password',
        'reset_password_token',
        'token_expires_time',
        'phone_number',
        'profile_picture',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'role_id' => 'integer',
    ];

    protected $hidden = [
        'password',
        'reset_password_token',
        'token_expires_time',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function getProfilePictureAttribute($value)
    {
        return $value ? asset($value) : null;
    }

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => 'api'
        ];
    }

    public function role()
    {
        return $this->hasOne(Role::class, 'id', 'role_id');
    }
}
