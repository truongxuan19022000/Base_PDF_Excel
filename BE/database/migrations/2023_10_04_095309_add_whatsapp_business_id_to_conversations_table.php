<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddWhatsappBusinessIdToConversationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->integer('whatsapp_business_id')->unsigned()->nullable()->after('customer_id');

            $table->foreign('whatsapp_business_id')->references('id')->on('whatsapp_business');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['whatsapp_business_id']);
            $table->dropColumn('whatsapp_business_id');
        });
    }
}
