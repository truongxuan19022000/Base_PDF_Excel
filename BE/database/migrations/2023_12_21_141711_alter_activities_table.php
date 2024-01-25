<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->string('message')->nullable()->after('action_type');
            $table->integer('material_id')->unsigned()->nullable()->after('document_id');
            $table->foreign('material_id')->references('id')->on('materials');
            $table->integer('customer_id')->unsigned()->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn(['message','material_id','customer_id']);
        });
    }
}
