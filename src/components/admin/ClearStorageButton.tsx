import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { clearAdminLocalStorage, getLocalStorageStats } from '@/utils/storageSync';
import { toast } from 'sonner';

export function ClearStorageButton() {
  const [open, setOpen] = useState(false);
  const stats = getLocalStorageStats();
  const totalItems = stats.products + stats.categories + stats.brands;

  if (totalItems === 0) return null;

  const handleClear = () => {
    clearAdminLocalStorage();
    setOpen(false);
    toast.success('Local storage cleared');
    window.location.reload();
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 mr-2" />
        Clear Storage ({totalItems})
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Local Storage</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all locally stored data:
              <ul className="mt-2 ml-4 space-y-1 text-sm">
                <li>• {stats.products} products</li>
                <li>• {stats.categories} categories</li>
                <li>• {stats.brands} brands</li>
              </ul>
              <p className="mt-3">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleClear} className="bg-destructive">
            Clear Storage
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
