<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WhatsappBusiness extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_ON  = 1;
    const STATUS_OFF = 0;

    protected $table = 'whatsapp_business';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'account_name',
        'whatsapp_business_account_id',
        'phone_number',
        'phone_number_id',
        'graph_version',
        'access_token',
        'status',
        'created_at',
        'updated_at',
    ];
}
