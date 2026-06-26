import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EMPTY_SELECT_VALUE = "__crm_empty__";

function CRMSelectField({
  className,
  items,
  onValueChange,
  placeholder,
  triggerClassName,
  value,
}) {
  const normalizedValue = value === "" ? EMPTY_SELECT_VALUE : value;

  return (
    <Select
      onValueChange={(nextValue) =>
        onValueChange(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)
      }
      value={normalizedValue}
    >
      <SelectTrigger
        className={cn(
          "h-12 w-full rounded-xl border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm",
          triggerClassName,
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl border-slate-200 bg-white shadow-lg">
        {items.map((item) => (
          <SelectItem
            disabled={item.disabled}
            key={item.value}
            value={item.value === "" ? EMPTY_SELECT_VALUE : item.value}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CRMSelectField;
