<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $table = 'conversations';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'user_id',
        'customer_id',
        'whatsapp_business_id',
        'is_pinned',
    ];

    protected $appends = [
        'messages_unread_count',
    ];

    public function customer()
    {
        return $this->hasOne(Customer::class, 'id', 'customer_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'id');
    }

    public function latest_message()
    {
        return $this->hasOne(Message::class, 'conversation_id', 'id')
                    ->where('delete_status', Message::STATUS_FALSE)
                    ->where('status', '<>', Message::STATUS_FAIL)
                    ->latest();
    }

    public function getMessagesUnreadCountAttribute()
    {
        return $this->hasMany(Message::class, 'conversation_id', 'id')
                    ->whereIn('status', [Message::STATUS_SENT, Message::STATUS_DELIVERED])
                    ->where('sender', Message::CUSTOMER)
                    ->where('delete_status', Message::STATUS_FALSE)
                    ->count();
    }
}
