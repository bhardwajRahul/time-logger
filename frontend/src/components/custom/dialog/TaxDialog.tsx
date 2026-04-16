import TaxForm from '@/components/custom/forms/TaxForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

type FormProps = PropsWithChildren & ComponentPropsWithoutRef<typeof TaxForm>;

export function TaxDialog({ children, ...props }: FormProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{props.mode === 'create' ? 'Create Tax' : 'Edit Tax'}</DialogTitle>
        </DialogHeader>
        <TaxForm {...props} />
      </DialogContent>
    </Dialog>
  );
}
