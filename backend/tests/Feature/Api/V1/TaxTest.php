<?php

use App\Enums\CacheTagEnum;
use App\Enums\TaxTypeEnum;
use App\Enums\TimeFrameStatusEnum;
use App\Models\Preference;
use App\Models\Project;
use App\Models\Tax;
use App\Models\TimeFrame;
use App\Models\User;
use App\Services\V1\TimeFrameServices;

use function Pest\Laravel\deleteJson;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;

beforeEach(function () {
    $this->user = User::factory()->create();

    Preference::factory()->create([
        'user_id' => $this->user->id,
        'hourly_rate' => 100,
        'currency' => 'USD',
    ]);

    $this->project = Project::factory()->create(['user_id' => $this->user->id]);

    $this->timeFrame = TimeFrame::factory()->create([
        'project_id' => $this->project->id,
        'start_date' => '2026-01-01',
        'end_date' => '2026-01-31',
        'hourly_rate' => 100,
        'currency' => 'USD',
    ]);

    $this->service = new TimeFrameServices;

    Cache::tags(CacheTagEnum::TAX->value)->flush();
    Cache::tags(CacheTagEnum::TIME_FRAME->value)->flush();
});

// ---------------------------------------------------------------------------
// Tax CRUD
// ---------------------------------------------------------------------------

describe('POST /api/v1/taxes', function () {
    it('creates a percentage tax and stores rate correctly', function () {
        $response = postJson('/api/v1/taxes', [
            'name' => 'VAT',
            'rate' => 0.20,
            'type' => 'percentage',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.attributes.name', 'VAT')
            ->assertJsonPath('data.attributes.type', 'percentage')
            ->assertJsonPath('data.attributes.isCompound', false)
            ->assertJsonPath('data.attributes.isInclusive', false)
            ->assertJsonPath('data.attributes.isEnabledByDefault', false);

        expect(Tax::first()->rate)->toEqual('0.2000');
    });

    it('creates a fixed tax', function () {
        $response = postJson('/api/v1/taxes', [
            'name' => 'Service Fee',
            'rate' => 5.00,
            'type' => 'fixed',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.attributes.type', 'fixed');

        expect((float) Tax::first()->rate)->toEqual(5.0);
    });

    it('rejects a percentage rate above 1', function () {
        postJson('/api/v1/taxes', [
            'name' => 'Bad Tax',
            'rate' => 20,
            'type' => 'percentage',
        ])->assertUnprocessable();
    });

    it('rejects a negative rate', function () {
        postJson('/api/v1/taxes', [
            'name' => 'Bad Tax',
            'rate' => -0.10,
            'type' => 'percentage',
        ])->assertUnprocessable();
    });

    it('requires name, rate and type', function () {
        postJson('/api/v1/taxes', [])->assertUnprocessable();
    });
});

describe('GET /api/v1/taxes', function () {
    it('returns paginated list of taxes', function () {
        Tax::factory()->count(3)->create(['user_id' => $this->user->id]);

        getJson('/api/v1/taxes')
            ->assertSuccessful()
            ->assertJsonCount(3, 'data');
    });
});

describe('GET /api/v1/taxes/{id}', function () {
    it('returns a single tax', function () {
        $tax = Tax::factory()->create(['user_id' => $this->user->id, 'name' => 'GST']);

        getJson("/api/v1/taxes/{$tax->id}")
            ->assertSuccessful()
            ->assertJsonPath('data.attributes.name', 'GST');
    });

    it('returns 404 for unknown id', function () {
        getJson('/api/v1/taxes/01JNFAKEIDDOESNOTEXISTZZ')
            ->assertNotFound();
    });
});

describe('PUT /api/v1/taxes/{id}', function () {
    it('updates name and rate', function () {
        $tax = Tax::factory()->create(['user_id' => $this->user->id, 'name' => 'Old', 'rate' => 0.10]);

        putJson("/api/v1/taxes/{$tax->id}", ['name' => 'New', 'rate' => 0.15, 'type' => 'percentage'])
            ->assertSuccessful()
            ->assertJsonPath('data.attributes.name', 'New');

        expect((float) $tax->fresh()->rate)->toEqual(0.15);
    });
});

describe('DELETE /api/v1/taxes/{id}', function () {
    it('deletes a tax and returns 404 afterwards', function () {
        $tax = Tax::factory()->create(['user_id' => $this->user->id]);

        deleteJson("/api/v1/taxes/{$tax->id}")->assertSuccessful();

        getJson("/api/v1/taxes/{$tax->id}")->assertNotFound();
    });
});

// ---------------------------------------------------------------------------
// Invoice tax calculation (exact numbers)
// ---------------------------------------------------------------------------

describe('computeTaxes', function () {
    /**
     * Helper: attach taxes to $this->timeFrame and load the relation.
     *
     * @param  array<array{tax: Tax, sort: int}>  $items
     */
    function attachTaxes(TimeFrame $timeFrame, array $items): TimeFrame
    {
        $sync = collect($items)->mapWithKeys(fn ($item) => [$item['tax']->id => ['sort' => $item['sort']]])->all();
        $timeFrame->taxes()->sync($sync);

        return $timeFrame->load('taxes');
    }

    it('returns subtotal unchanged when no taxes are attached', function () {
        $this->timeFrame->load('taxes');

        $result = $this->service->computeTaxes($this->timeFrame, 100.00);

        expect($result['subtotal'])->toEqual(100.00)
            ->and($result['taxLines'])->toBeEmpty()
            ->and($result['grandTotal'])->toEqual(100.00);
    });

    it('applies a single exclusive percentage tax (20% VAT)', function () {
        $vat = Tax::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'VAT',
            'rate' => 0.20,
            'type' => TaxTypeEnum::Percentage,
            'is_compound' => false,
            'is_inclusive' => false,
        ]);

        $tf = attachTaxes($this->timeFrame, [['tax' => $vat, 'sort' => 100]]);

        $result = $this->service->computeTaxes($tf, 100.00);

        expect($result['subtotal'])->toEqual(100.00)
            ->and($result['taxLines'][0]['amount'])->toEqual(20.00)
            ->and($result['grandTotal'])->toEqual(120.00);
    });

    it('back-calculates an inclusive tax (10% GST inclusive on 110.00)', function () {
        // Gross price is 110.00 which already includes 10% tax.
        // Back-calc: 110 × 0.10 / 1.10 = 10.00 tax embedded.
        $gst = Tax::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'GST',
            'rate' => 0.10,
            'type' => TaxTypeEnum::Percentage,
            'is_compound' => false,
            'is_inclusive' => true,
        ]);

        $tf = attachTaxes($this->timeFrame, [['tax' => $gst, 'sort' => 100]]);

        $result = $this->service->computeTaxes($tf, 110.00);

        expect($result['taxLines'][0]['amount'])->toEqual(10.00)
            ->and($result['grandTotal'])->toEqual(110.00); // inclusive: total stays the same
    });

    it('applies a fixed fee', function () {
        $fee = Tax::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Service Fee',
            'rate' => 5.00,
            'type' => TaxTypeEnum::Fixed,
            'is_compound' => false,
            'is_inclusive' => false,
        ]);

        $tf = attachTaxes($this->timeFrame, [['tax' => $fee, 'sort' => 100]]);

        $result = $this->service->computeTaxes($tf, 100.00);

        expect($result['taxLines'][0]['amount'])->toEqual(5.00)
            ->and($result['grandTotal'])->toEqual(105.00);
    });

    it('applies two exclusive non-compound taxes (10% + 5%)', function () {
        // Both base on subtotal: 100 × 0.10 = 10 + 100 × 0.05 = 5 → total 115
        $t1 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax A', 'rate' => 0.10,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => false,
        ]);
        $t2 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax B', 'rate' => 0.05,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => false,
        ]);

        $tf = attachTaxes($this->timeFrame, [
            ['tax' => $t1, 'sort' => 100],
            ['tax' => $t2, 'sort' => 200],
        ]);

        $result = $this->service->computeTaxes($tf, 100.00);

        expect($result['taxLines'][0]['amount'])->toEqual(10.00)
            ->and($result['taxLines'][1]['amount'])->toEqual(5.00)
            ->and($result['grandTotal'])->toEqual(115.00);
    });

    it('applies compound tax on top of prior taxes (10% + 5% compound = 115.50)', function () {
        // Tax A (10%, non-compound): base = 100 → amount = 10
        // Tax B (5%, compound):      base = 100 + 10 = 110 → amount = 5.50
        // Grand total = 100 + 10 + 5.50 = 115.50
        $t1 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax A', 'rate' => 0.10,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => false,
        ]);
        $t2 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax B (compound)', 'rate' => 0.05,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => true,
        ]);

        $tf = attachTaxes($this->timeFrame, [
            ['tax' => $t1, 'sort' => 100],
            ['tax' => $t2, 'sort' => 200],
        ]);

        $result = $this->service->computeTaxes($tf, 100.00);

        expect($result['taxLines'][0]['amount'])->toEqual(10.00)
            ->and($result['taxLines'][1]['amount'])->toEqual(5.50)
            ->and($result['grandTotal'])->toEqual(115.50);
    });

    it('respects sort order when applying taxes', function () {
        // Attached in reverse — sort should override attach order
        // Tax A (5%, compound, sort=200): base = 100 + 10 = 110 → 5.50
        // Tax B (10%, non-compound, sort=100): base = 100 → 10
        $t1 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax 10%', 'rate' => 0.10,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => false,
        ]);
        $t2 = Tax::factory()->create([
            'user_id' => $this->user->id, 'name' => 'Tax 5% compound', 'rate' => 0.05,
            'type' => TaxTypeEnum::Percentage, 'is_compound' => true,
        ]);

        // Intentionally attach t2 first with higher sort, t1 second with lower sort
        $tf = attachTaxes($this->timeFrame, [
            ['tax' => $t2, 'sort' => 200],
            ['tax' => $t1, 'sort' => 100],
        ]);

        $result = $this->service->computeTaxes($tf, 100.00);

        // t1 (sort=100) processed first → 10.00
        // t2 (sort=200, compound) → base 110 → 5.50
        expect($result['taxLines'][0]['name'])->toBe('Tax 10%')
            ->and($result['taxLines'][0]['amount'])->toEqual(10.00)
            ->and($result['taxLines'][1]['name'])->toBe('Tax 5% compound')
            ->and($result['taxLines'][1]['amount'])->toEqual(5.50)
            ->and($result['grandTotal'])->toEqual(115.50);
    });
});

// ---------------------------------------------------------------------------
// Tax attachment on TimeFrame creation
// ---------------------------------------------------------------------------

describe('tax attachment on TimeFrame creation', function () {
    it('attaches taxes passed in the data array', function () {
        $vat = Tax::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'VAT',
            'rate' => 0.20,
            'type' => TaxTypeEnum::Percentage,
            'sort' => 100,
        ]);

        $gst = Tax::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'GST',
            'rate' => 0.10,
            'type' => TaxTypeEnum::Percentage,
            'sort' => 200,
        ]);

        $newTimeFrame = $this->service->createTimeframe([
            'project_id' => $this->project->id,
            'name' => 'New Frame',
            'start_date' => '2026-02-01',
            'end_date' => '2026-02-28',
            'hourly_rate' => 100,
            'currency' => 'USD',
            'status' => TimeFrameStatusEnum::IN_PROGRESS,
            'taxes' => [
                $vat->id,
                $gst->id,
            ],
        ]);

        $taxes = $newTimeFrame->fresh()->taxes()->get();

        expect($taxes)->toHaveCount(2);
        expect($taxes->pluck('name')->all())->toBe(['VAT', 'GST']);
        expect($taxes->first()->sort)->toBe(100);
        expect($taxes->last()->sort)->toBe(200);
    });

    it('creates a TimeFrame with no taxes when none are passed', function () {
        $newTimeFrame = $this->service->createTimeframe([
            'project_id' => $this->project->id,
            'name' => 'Frame',
            'start_date' => '2026-03-01',
            'end_date' => '2026-03-31',
            'hourly_rate' => 100,
            'currency' => 'USD',
            'status' => TimeFrameStatusEnum::IN_PROGRESS,
        ]);

        expect($newTimeFrame->fresh()->taxes)->toBeEmpty();
    });
});
