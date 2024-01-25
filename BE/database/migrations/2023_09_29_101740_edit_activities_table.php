<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EditActivitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->integer('quotation_id')->unsigned()->nullable()->change();
            $table->integer('invoice_id')->unsigned()->nullable()->after('quotation_id');
            $table->integer('document_id')->unsigned()->nullable()->after('invoice_id');
            $table->integer('user_id')->unsigned()->change();
            $table->smallInteger('action_type')->change();
            $table->dropColumn('content');

            $table->foreign('invoice_id')->references('id')->on('invoices');
            $table->foreign('document_id')->references('id')->on('documents');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');
        Schema::table('activities', function (Blueprint $table) {
            $table->integer('quotation_id')->unsigned()->nullable(false)->change();
            $table->dropForeign(['invoice_id']);
            $table->dropColumn('invoice_id');
            $table->dropForeign(['document_id']);
            $table->dropColumn('document_id');
            $table->dropForeign(['user_id']);
            $table->string('action_type', 100)->change();
            $table->string('content', 255)->after('action_type');
        });
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');
    }
}
