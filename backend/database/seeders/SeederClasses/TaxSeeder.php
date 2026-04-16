<?php

namespace Database\Seeders\SeederClasses;

use App\Enums\TaxTypeEnum;
use App\Models\Tax;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            return;
        }

        Tax::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'VAT 20%'],
            [
                'rate' => 0.2000,
                'type' => TaxTypeEnum::Percentage,
                'is_compound' => false,
                'is_inclusive' => false,
                'enabled_by_default' => true,
            ]
        );

        Tax::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'GST 10%'],
            [
                'rate' => 0.1000,
                'type' => TaxTypeEnum::Percentage,
                'is_compound' => false,
                'is_inclusive' => false,
                'enabled_by_default' => false,
            ]
        );

        Tax::firstOrCreate(
            ['user_id' => $user->id, 'name' => 'Service Fee'],
            [
                'rate' => 5.0000,
                'type' => TaxTypeEnum::Fixed,
                'is_compound' => false,
                'is_inclusive' => false,
                'enabled_by_default' => false,
            ]
        );
    }
}
