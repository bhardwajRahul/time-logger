import MergeTimeEntryForm from '@/components/custom/forms/MergeTimeEntryForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TimeEntryResource } from '@/interfaces/entity/time-entry';

interface MergeTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEntry: TimeEntryResource;
  newEntry: TimeEntryResource;
}

export function MergeTimeEntryDialog({
  open,
  onOpenChange,
  existingEntry,
  newEntry,
}: MergeTimeEntryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Merge Day Entries?</DialogTitle>
        </DialogHeader>
        <MergeTimeEntryForm existingEntry={existingEntry} newEntry={newEntry} />
      </DialogContent>
    </Dialog>
  );
}
