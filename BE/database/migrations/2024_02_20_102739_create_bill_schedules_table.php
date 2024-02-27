<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillSchedulesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('bill_schedules', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('order_number')->unsigned();
            $table->integer('invoice_id')->unsigned();
            $table->string('type_invoice_statement');
            $table->integer('type_percentage');
            $table->unsignedDecimal('amount', 12, 2)->default(null)->nullable();

            $table->foreign('invoice_id')->references('id')->on('invoices');
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
        Schema::dropIfExists('bill_schedules');
    }
}
