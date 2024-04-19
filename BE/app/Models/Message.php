<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    const STATUS_FALSE     = 0;
    const STATUS_TRUE      = 1;
    const BUSINESS         = 0;
    const CUSTOMER         = 1;
    const STATUS_SENT      = 0;
    const STATUS_DELIVERED = 1;
    const STATUS_READ      = 2;
    const STATUS_FAIL      = 3;

    protected $table = 'messages';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'conversation_id',
        'whatsapp_message_id',
        'reply_whatsapp_message_id',
        'content',
        'reaction_by_business',
        'reaction_by_customer',
        'starred',
        'status',
        'sender',
        'delete_status',
        'created_at',
        'updated_at'
    ];

    public function getContentAttribute($value)
    {
        return json_decode($value, true);
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }
}
