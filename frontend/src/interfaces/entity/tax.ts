import type {
  ApiResource,
  GenericRelationship,
  PaginatedApiRes,
  SingleApiRes,
} from '../global';
import type { TimeFrameResource } from './time-frame';

export type TaxType = 'fixed' | 'percentage';

export interface TaxAttrs {
  name: string;
  rate: number;
  type: TaxType;
  isCompound: boolean;
  isInclusive: boolean;
  isEnabledByDefault: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaxInc {
  timeFrames?: TimeFrameResource[];
}

export interface TaxRel {
  user: GenericRelationship;
}

export type Tax = SingleApiRes<TaxAttrs, TaxInc, TaxRel>;
export type Taxs = PaginatedApiRes<TaxAttrs, TaxInc, TaxRel>;
export type TaxResource = ApiResource<TaxAttrs, TaxInc, TaxRel>;
