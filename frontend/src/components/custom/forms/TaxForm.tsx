import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { TaxResource } from '@/interfaces/entity/tax';
import type { GenericErrorResponse } from '@/interfaces/global';
import { createTax, updateTax } from '@/lib/data-access/tax';
import { TAX_SCHEMA, type TaxFormType } from '@/lib/schema/tax';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_API_PAGE_SIZE, SWR_CACHE_KEYS } from '@/config';
import useDismissModal from '@/hooks/use-dismiss-modal';
import { parseError } from '@/utils/error-handling';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import FormErrors from './FormErrors';

interface TaxFormProps {
  tax?: TaxResource;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

function toDisplayRate(rate: number, type: 'percentage' | 'fixed'): number {
  return type === 'percentage' ? rate * 100 : rate;
}

function toApiRate(displayRate: number, type: 'percentage' | 'fixed'): number {
  return type === 'percentage' ? displayRate / 100 : displayRate;
}

export default function TaxForm({ tax, mode, onSuccess }: TaxFormProps) {
  const [serverErrors, setServerErrors] = useState<GenericErrorResponse>({});
  const { dismiss } = useDismissModal();
  const navigate = useNavigate();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [pageNumber] = useQueryState('pageNumber', { defaultValue: '1' });
  const [pageSize] = useQueryState('pageSize', {
    defaultValue: DEFAULT_API_PAGE_SIZE.toString(),
  });

  const existingType = tax?.attributes.type ?? 'percentage';

  const form = useForm<TaxFormType>({
    resolver: zodResolver(TAX_SCHEMA),
    defaultValues: {
      name: tax?.attributes.name ?? '',
      rate: tax
        ? toDisplayRate(Number(tax.attributes.rate), existingType)
        : undefined,
      type: existingType,
      is_compound: tax?.attributes.isCompound ?? false,
      is_inclusive: tax?.attributes.isInclusive ?? false,
      enabled_by_default: tax?.attributes.isEnabledByDefault ?? false,
    },
  });

  const watchedType = form.watch('type');

  async function onSubmit(values: TaxFormType) {
    setServerErrors({});
    try {
      const payload = {
        ...values,
        rate: toApiRate(values.rate, values.type),
      };

      const response =
        mode === 'edit' && tax
          ? await updateTax({ id: tax.id, payload })
          : await createTax({ payload });

      if (response.status > 299) {
        throw new Error(
          `Failed to ${mode === 'edit' ? 'update' : 'create'} tax`,
        );
      }

      dismiss();

      toast.success(
        `Tax ${mode === 'edit' ? 'updated' : 'created'} successfully`,
        mode === 'create'
          ? {
              action: {
                label: 'View Tax?',
                onClick: () => navigate({ to: `/taxes/${response.data.id}` }),
              },
              duration: 5000,
            }
          : undefined,
      );

      mutate([SWR_CACHE_KEYS.TAXES, pageNumber, pageSize]);
      // Invalidate loader-based routes (e.g. /taxes/$taxId detail page)
      router.invalidate();

      onSuccess?.();
    } catch (error) {
      const { statusCode, errors } = parseError(error);
      toast.error(`Request failed with status code ${statusCode}`);
      setServerErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="VAT"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors.name && (
                <p className="text-destructive text-sm">
                  {serverErrors.name.join(', ')}
                </p>
              )}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Type</FieldLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  // Reset rate when type changes to avoid confusion
                  form.setValue('rate', undefined as unknown as number);
                  // Compound only applies to percentage taxes
                  if (val !== 'percentage') {
                    form.setValue('is_compound', false);
                  }
                }}
                defaultValue={field.value}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed (flat amount)</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors.type && (
                <p className="text-destructive text-sm">
                  {serverErrors.type.join(', ')}
                </p>
              )}
            </Field>
          )}
        />

        <Controller
          name="rate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Rate{watchedType === 'percentage' ? ' (%)' : ' (flat amount)'}
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                step={watchedType === 'percentage' ? '0.01' : '0.01'}
                min="0"
                max={watchedType === 'percentage' ? '100' : undefined}
                placeholder={watchedType === 'percentage' ? '20' : '5.00'}
                aria-invalid={fieldState.invalid}
                value={field.value ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === '' ? undefined : Number(value));
                }}
              />
              <p className="text-muted-foreground text-xs">
                {watchedType === 'percentage'
                  ? 'Enter a value between 0 and 100. Example: 20 for 20%.'
                  : 'Enter a flat currency amount. Example: 5.00 for a $5 fee.'}
              </p>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {serverErrors.rate && (
                <p className="text-destructive text-sm">
                  {serverErrors.rate.join(', ')}
                </p>
              )}
            </Field>
          )}
        />

        <div className="space-y-4 p-4 bg-accent rounded-lg">
          <Controller
            name="is_compound"
            control={form.control}
            render={({ field }) => (
              <Field
                orientation="horizontal"
                data-disabled={watchedType !== 'percentage'}
                className={watchedType !== 'percentage' ? 'opacity-40' : ''}
              >
                <div className="flex flex-col gap-0.5 flex-1">
                  <FieldLabel htmlFor="is_compound">Compound Tax?</FieldLabel>
                  <p className="text-muted-foreground text-xs">
                    Percentage taxes only. Applied on top of the subtotal plus all prior taxes.
                  </p>
                </div>
                <Switch
                  id="is_compound"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={watchedType !== 'percentage'}
                />
              </Field>
            )}
          />

          <Controller
            name="is_inclusive"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex flex-col gap-0.5 flex-1">
                  <FieldLabel htmlFor="is_inclusive">Inclusive Tax?</FieldLabel>
                  <p className="text-muted-foreground text-xs">
                    Already baked into the price. Shown for transparency. Does
                    not increase the total. (off by default)
                  </p>
                </div>
                <Switch
                  id="is_inclusive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <Controller
            name="enabled_by_default"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex flex-col gap-0.5 flex-1">
                  <FieldLabel htmlFor="enabled_by_default">
                    Enable by default?
                  </FieldLabel>
                  <p className="text-muted-foreground text-xs">
                    New Time frames will have this tax enabled by default,
                    unless you toggle it off.
                  </p>
                </div>
                <Switch
                  id="enabled_by_default"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </div>

        <FormErrors errors={serverErrors} />

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={dismiss}>
            Close
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? mode === 'edit'
                ? 'Updating...'
                : 'Creating...'
              : mode === 'edit'
                ? 'Update Tax'
                : 'Create Tax'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
