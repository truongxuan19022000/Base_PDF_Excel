<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWhatsappBusinessTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('whatsapp_business', function (Blueprint $table) {
            $table->increments('id');
            $table->string('account_name');
            $table->string('whatsapp_business_account_id');
            $table->string('phone_number');
            $table->string('phone_number_id');
            $table->string('graph_version');
            $table->string('access_token');
            $table->tinyInteger('status')->default('0')->comment('0: off, 1: on');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('whatsapp_business');
    }
}
