import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { TimeEntryResource } from '@/interfaces/entity/time-entry';
import type { GenericErrorResponse } from '@/interfaces/global';
import { mergeTimeEntries } from '@/lib/data-access/time-entry';
import {
  MERGE_TIME_ENTRY_SCHEMA,
  type MergeTimeEntryFormType,
} from '@/lib/schema/merge-time-entry';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import useDismissModal from '@/hooks/use-dismiss-modal';
import { computeMergedDuration } from '@/utils/date-time';
import { truncate } from '@/utils/dom';
import { parseError } from '@/utils/error-handling';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import FormErrors from './FormErrors';

interface MergeTimeEntryFormProps {
  existingEntry: TimeEntryResource;
  newEntry: TimeEntryResource;
}

function combinedDescription(
  existingEntry: TimeEntryResource,
  newEntry: TimeEntryResource,
): string {
  return [existingEntry.attributes.description, newEntry.attributes.description]
    .filter((d) => d && d.trim())
    .join('\n');
}

export default function MergeTimeEntryForm({
  existingEntry,
  newEntry,
}: MergeTimeEntryFormProps) {
  const [serverErrors, setServerErrors] = useState<GenericErrorResponse>({});
  const { dismiss } = useDismissModal();
  const router = useRouter();

  const mergedDuration = computeMergedDuration(
    [existingEntry.attributes.startTime, newEntry.attributes.startTime],
    [existingEntry.attributes.endTime, newEntry.attributes.endTime],
  );

  const form = useForm<MergeTimeEntryFormType>({
    resolver: zodResolver(MERGE_TIME_ENTRY_SCHEMA),
    defaultValues: {
      description: combinedDescription(existingEntry, newEntry),
    },
  });

  async function onSubmit(values: MergeTimeEntryFormType) {
    setServerErrors({});
    try {
      await mergeTimeEntries({
        ids: [existingEntry.id, newEntry.id],
        description: values.description ?? '',
      });
      toast.success('Entries merged successfully');
      router.invalidate();
      dismiss();
    } catch (error) {
      const { statusCode, errors } = parseError(error);
      toast.error(`Request failed with status code ${statusCode}`);
      setServerErrors((prev) => ({ ...prev, ...errors }));
    }
  }

  function handleKeepSeparate() {
    dismiss();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="text-muted-foreground text-sm space-y-0.5">
          <p>
            Hey, we found an existing entry at{' '}
            <span className="text-foreground font-medium">
              {format(new Date(existingEntry.attributes.startTime), 'h:mm a')}
            </span>
            <br />
            With the description:{' '}
            {existingEntry.attributes.description?.trim() && (
              <span className="text-foreground italic text-sm">
                "{truncate(existingEntry.attributes.description)}"
              </span>
            )}
          </p>
          <p>
            Merged duration:{' '}
            <span className="text-foreground font-medium">
              {mergedDuration}
            </span>
          </p>
        </div>

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Combined description</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Describe the merged work..."
                className="resize-none"
                rows={4}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FormErrors errors={serverErrors} />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleKeepSeparate}
            disabled={form.formState.isSubmitting}
          >
            Do Nothing
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Merging...' : 'Merge Entries'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
