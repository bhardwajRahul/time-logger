<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Filters\Api\V1\Filters\TaxFilter;
use App\Http\Requests\Tax\RearrangeTaxRequest;
use App\Http\Requests\Tax\TaxRequest;
use App\Http\Resources\Api\V1\TaxResource;
use App\Services\V1\TaxServices;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TaxController extends ApiController
{
    public function __construct(protected TaxServices $taxServices) {}

    /**
     * Get all Taxes (paginated).
     */
    public function index(TaxFilter $filters)
    {
        try {
            $taxes = $this->taxServices->getTaxes($filters);

            return TaxResource::collection($taxes);
        } catch (\Exception $e) {
            return $this->error('Taxes Retrieval Error', $e->getMessage(), 500);
        }
    }

    /**
     * Store a new Tax.
     */
    public function store(TaxRequest $request)
    {
        try {
            $tax = $this->taxServices->createTax($request->validated());

            return $this->ok('Tax Created', new TaxResource($tax), 201);
        } catch (\Exception $e) {
            return $this->error('Tax Creation Error', $e->getMessage(), 500);
        }
    }

    /**
     * Store a new Tax.
     */
    public function rearrange(RearrangeTaxRequest $request)
    {
        try {
            $this->taxServices->rearrangeTaxes($request->validated());

            return $this->ok('Taxes rearranged successfully', null);
        } catch (\Exception $e) {
            return $this->error('Tax Rearrange Error', $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified Tax.
     */
    public function show(string $id, TaxFilter $filters)
    {
        try {
            $tax = $this->taxServices->getTax($id, $filters);

            return $this->ok('Tax Retrieved Successfully', new TaxResource($tax));
        } catch (ModelNotFoundException $e) {
            return $this->error('Tax not found', null, 404);
        } catch (\Exception $e) {
            return $this->error('Tax Error', null, 500);
        }
    }

    /**
     * Update the specified Tax.
     */
    public function update(TaxRequest $request, string $id)
    {
        try {
            $tax = $this->taxServices->getTaxById($id);
            $tax = $this->taxServices->updateTax($tax, $request->validated());

            return $this->ok('Tax Updated', new TaxResource($tax));
        } catch (ModelNotFoundException $e) {
            return $this->error('Tax not found', null, 404);
        } catch (\Exception $e) {
            return $this->error('Tax Update Error', $e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified Tax.
     */
    public function destroy(string $id)
    {
        try {
            $tax = $this->taxServices->getTaxById($id);
            $this->taxServices->deleteTax($tax);

            return $this->ok('Tax deleted successfully', null);
        } catch (ModelNotFoundException $e) {
            return $this->error('Tax not found', null, 404);
        } catch (\Exception $e) {
            return $this->error('Tax deletion failed', null, 500);
        }
    }
}
