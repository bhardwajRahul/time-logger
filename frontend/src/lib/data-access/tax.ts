import { DEFAULT_API_PAGE_SIZE } from '@/config';
import type { Tax, TaxResource, Taxs } from '@/interfaces/entity/tax';
import type {
  GenericApiPagniatedRequestParams,
  GenericApiRes,
  GenericApiSignleRequestParams,
} from '@/interfaces/global';
import { buildQueryString } from '@/utils/request';
import { fetcher } from '../api/fetcher';
import { deleteResource, postResource, putResource } from '../api/mutations';
import type { TaxFormType } from '../schema/tax';

export type TaxApiPayload = Omit<TaxFormType, 'rate'> & {
  rate: number;
  sort?: number;
};

export async function getTaxes({
  pageSize,
  pageNumber,
  sort,
  include,
  add,
}: GenericApiPagniatedRequestParams = {}): Promise<Taxs> {
  const params = buildQueryString({
    'page[size]': pageSize?.toString() ?? DEFAULT_API_PAGE_SIZE.toString(),
    'page[number]': pageNumber?.toString() ?? '1',
    sort: sort ?? '',
    include: include ?? '',
    add: add ?? '',
  });
  return await fetcher<Taxs>(`/taxes${params}`);
}

export async function getTax({
  identifier,
  include,
  add,
}: GenericApiSignleRequestParams): Promise<TaxResource> {
  const params = buildQueryString({
    include: include ?? '',
    add: add ?? '',
  });
  return (await fetcher<Tax>(`/taxes/${identifier}${params}`)).data;
}

export async function createTax({
  payload,
}: {
  payload: TaxApiPayload;
}): Promise<Tax> {
  return await postResource<Tax>(`/taxes`, payload);
}

export async function updateTax({
  id,
  payload,
}: {
  id: string;
  payload: TaxApiPayload;
}): Promise<Tax> {
  return await putResource<Tax>(`/taxes/${id}`, payload);
}

export async function deleteTax({ id }: { id: string }): Promise<GenericApiRes> {
  return await deleteResource<GenericApiRes>(`/taxes/${id}`);
}

export async function rearrangeTaxes({
  taxes,
}: {
  taxes: Array<{ id: string; sort: number }>;
}): Promise<GenericApiRes> {
  return await postResource<GenericApiRes>(`/taxes/rearrange`, { taxes });
}
