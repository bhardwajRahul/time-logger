<?php

namespace Database\Factories;

use App\Enums\TaxTypeEnum;
use App\Models\Tax;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tax>
 */
class TaxFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['VAT', 'GST', 'Sales Tax', 'Service Charge']),
            'rate' => fake()->randomElement([0.05, 0.10, 0.15, 0.20]),
            'type' => TaxTypeEnum::Percentage,
            'is_compound' => false,
            'is_inclusive' => false,
            'enabled_by_default' => false,
            'sort' => 100,
        ];
    }

    public function percentage(): static
    {
        return $this->state(fn () => [
            'type' => TaxTypeEnum::Percentage,
        ]);
    }

    public function fixed(): static
    {
        return $this->state(fn () => [
            'type' => TaxTypeEnum::Fixed,
            'rate' => fake()->randomFloat(2, 1, 50),
        ]);
    }

    public function compound(): static
    {
        return $this->state(fn () => [
            'is_compound' => true,
        ]);
    }

    public function inclusive(): static
    {
        return $this->state(fn () => [
            'is_inclusive' => true,
        ]);
    }

    public function asDefault(): static
    {
        return $this->state(fn () => [
            'enabled_by_default' => true,
        ]);
    }
}
