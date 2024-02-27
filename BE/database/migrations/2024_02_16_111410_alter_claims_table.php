<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterClaimsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::table('claims', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn(['reference_no', 'customer_id', 'price']);
            $table->integer('quotation_id')->unsigned()->after('claim_no');
            $table->date('payment_received_date')->nullable()->after('issue_date');
            $table->unsignedDecimal('deposit_amount', 12, 2)->default(null)->nullable()->after('payment_received_date');
            $table->unsignedDecimal('total_from_claim', 12, 2)->default(null)->nullable()->after('deposit_amount');
            $table->tinyInteger('isCopied')->after('total_from_claim')->default(0);
            $table->string('previous_claim_no')->after('isCopied')->nullable();

            $table->foreign('quotation_id')->references('id')->on('quotations');
        });
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('claims', function (Blueprint $table) {
            $table->dropColumn(['quotation_id', 'payment_received_date', 'deposit_amount', 'total_from_claim']);
        });
    }
}
