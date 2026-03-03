export type CustomFieldInputProps<TValue> = {
  attribute: {
    type: string;
  };
  disabled?: boolean;
  error?: string;
  hint?: string;
  label?: string;
  name: string;
  onChange: (event: {
    target: {
      name: string;
      type: string;
      value: TValue;
    };
  }) => void;
  required?: boolean;
  value?: TValue;
};
