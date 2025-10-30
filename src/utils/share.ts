import { formatCurrency } from './currency';

export interface ShareCampData {
  id: string;
  name: string;
  category: string;
  location: string;
  ageMin: number;
  ageMax: number;
  price: number;
  currency: string;
}

export async function shareCamp(
  campData: ShareCampData,
  onCopySuccess?: () => void
): Promise<boolean> {
  const campUrl = `${window.location.origin}/camps/${campData.id}`;

  const shareData = {
    title: campData.name,
    text: `Check out this amazing camp: ${campData.name}! ${campData.category} camp in ${campData.location} for ages ${campData.ageMin}-${campData.ageMax}. Starting at ${formatCurrency(campData.price, campData.currency)}.`,
    url: campUrl,
  };

  try {
    // Check if Web Share API is supported
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(campUrl);
      if (onCopySuccess) {
        onCopySuccess();
      }
      return true;
    }
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(campUrl);
        if (onCopySuccess) {
          onCopySuccess();
        }
        return true;
      } catch (clipboardError) {
        console.error('Failed to share or copy:', clipboardError);
        return false;
      }
    }
    return false;
  }
}
