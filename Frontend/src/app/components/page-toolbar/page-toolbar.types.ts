export interface ToolbarAction {
  label: string;
  icon: string;
  onClick: () => void;
  styleClass?: string;
}

export interface Metric {
  icon: string;
  value: string | number;
  label: string;
}
