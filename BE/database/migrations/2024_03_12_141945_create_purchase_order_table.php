<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePurchaseOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('vendor_id')->unsigned();
            $table->string('purchase_order_no');
            $table->tinyInteger('status')->default(1)->comment('1:Unsent, 2: Sent');
            $table->unsignedDecimal('subtotal', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('shipping_fee', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('discount_amount', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('tax', 12, 2)->default(null)->nullable();
            $table->unsignedDecimal('total_amount', 12, 2)->default(null)->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('vendor_id')->references('id')->on('vendors');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('purchase_orders');
    }
}
