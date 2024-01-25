<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class EditQuotationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->unsignedDecimal('price', 8, 2)->default(0)->after('status');
            $table->string('sales_person')->nullable()->after('price');
            $table->date('issue_date')->nullable()->after('sales_person');
            $table->date('due_date')->nullable()->after('issue_date');
            $table->string('description')->nullable()->after('due_date');
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
            $table->dropColumn('price', 'sales_person', 'issue_date', 'due_date', 'description');
        });
    }
}
