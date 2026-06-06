import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

type SortButtonProps = {
  field: string;
  active: string;
  order: string;
  onSort: (field: string) => void;
};

export function SortButton({ field, active, order, onSort }: SortButtonProps) {
  const isActive = active === field;
  return (
    <button className="icon-button" type="button" title={`Sort by ${field}`} onClick={() => onSort(field)}>
      {isActive && order === 'DESC' ? <ArrowDownAZ size={16} /> : <ArrowUpAZ size={16} />}
    </button>
  );
}
