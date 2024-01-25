<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'customers';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id',
        'name',
        'email',
        'phone_number',
        'address',
        'postal_code',
        'company_name',
        'status',
        'status_updated_at',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $hidden = [];

    public function getAddressAttribute($value)
    {
        return json_decode($value, true);
    }

    public function conversation()
    {
        return $this->hasOne(Conversation::class, 'customer_id', 'id')
                ->join('whatsapp_business', 'whatsapp_business.id', 'conversations.whatsapp_business_id')
                ->where('whatsapp_business.status', WhatsappBusiness::STATUS_ON);
    }

}
