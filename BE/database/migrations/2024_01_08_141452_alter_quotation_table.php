<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterQuotationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->renameColumn('due_date', 'valid_till');
            $table->dropColumn('sales_person');
            $table->integer('terms_of_payment_confirmation')->nullable()->after('description');
            $table->integer('terms_of_payment_balance')->nullable()->after('terms_of_payment_confirmation');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->renameColumn('valid_till', 'due_date');
            $table->dropColumn(['terms_of_payment_confirmation','terms_of_payment_balance']);
        });
    }
}
