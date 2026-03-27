const variants = {
  Pending: 'badge-pending',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
  High: 'priority-high',
  Medium: 'priority-medium',
  Low: 'priority-low',
};

export default function Badge({ children, variant }) {
  const cls = variants[variant] || 'badge-pending';
  return <span className={cls}>{children}</span>;
}
