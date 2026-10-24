export function formatUGX(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'UGX 0';
  return `UGX ${amount.toLocaleString('en-UG')}`;
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'paid':
    case 'verified':
      return 'bg-forest-50 text-forest-700 border-forest-200';
    case 'in_progress':
    case 'confirmed':
    case 'payment_requested':
    case 'matched':
    case 'scheduled':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'pending':
    case 'applied':
    case 'under_review':
    case 'verification':
    case 'open':
    case 'suggested':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'declined':
    case 'failed':
    case 'refunded':
    case 'cancelled':
    case 'rejected':
    case 'suspended':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-ink-50 text-ink-700 border-ink-200';
  }
}
