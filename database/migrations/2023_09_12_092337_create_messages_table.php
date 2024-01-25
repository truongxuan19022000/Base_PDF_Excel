<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('conversation_id');
            $table->string('whatsapp_message_id');
            $table->string('reply_whatsapp_message_id')->nullable();
            $table->json('content');
            $table->string('reaction_by_business')->nullable();
            $table->string('reaction_by_customer')->nullable();
            $table->tinyInteger('starred')->default('0')->comment('0: no starred, 1: starred');
            $table->tinyInteger('status')->comment('0: sent, 1: delivered, 2: read, 3: failed');
            $table->tinyInteger('sender')->comment('0: business sent, 1: customer sent');
            $table->tinyInteger('delete_status')->default('0')->comment('0: no delete, 1: delete');
            $table->timestamps();

            $table->foreign('conversation_id')->references('id')->on('conversations');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
